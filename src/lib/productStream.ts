import { getApiRoot } from "./client";
import { PassThrough } from "stream";
import { ProductProjection } from "@commercetools/platform-sdk";
import { later } from "./lib";
//@ts-ignore
export default () => {
  const productStream = new PassThrough({
    objectMode: true,
    highWaterMark: 200,
  });
  fetchAll(
    productStream,
    //fetching products modified in the last hour
    new Date(Date.now() - 100000 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ).catch((e) => console.log("error:", e));

  return productStream;
};
type WriteProductsArg = {
  results: ProductProjection[];
  productStream: PassThrough;
};
type WriteProducts = (arg: WriteProductsArg) => Promise<void>;
const writeProducts: WriteProducts = async ({ results, productStream }) => {
  let writeCounter = 0;
  while (writeCounter < results.length) {
    if (productStream.writableNeedDrain) {
      break;
    }
    productStream.write(["SUCCESS", results[writeCounter]]);
    writeCounter++;
  }
  if (writeCounter !== results.length) {
    await later(500);
    //@note: because this is a recursive call it can lead to a stack overflow
    //  or high memory use when items are not consumed from the stream fast enough
    //  you can increase the wait time (is 500 above this comment) if this happens
    await writeProducts({
      results: results.slice(writeCounter),
      productStream,
    });
  }
};
async function fetchAll(
  productStream: PassThrough,
  lastModifiedAtFrom: string,
  lastModifiedAtTo: string
) {
  const limit = 20;
  const { get, set } = (function () {
    const processed = new Map<string, boolean>();
    const ids = new Array(4 * limit);
    const set = (id: string) => {
      processed.set(id, true);
      ids.push(id);
    };
    //@note: if large amount of products are processed then
    //  do not let the processed map get too large, only store
    //  last 4 sets
    if (ids.length >= 4 * limit) {
      const remove = ids.splice(0, 2 * limit);
      remove.forEach((id) => processed.delete(id));
    }
    const get = (id: string) => processed.get(id);
    return { get, set };
  })();
  const recur = async (
    productStream: PassThrough,
    lastModifiedAtFrom: string,
    lastModifiedAtTo: string
  ) => {
    try {
      //@note: if you only want published changes you can add 2 items to the where
      //  array, the lastModifiedAt and "masterData(published=true)"
      const filter = `lastModifiedAt:range ("${lastModifiedAtFrom}" to "${lastModifiedAtTo}")`;

      const response = await getApiRoot()
        .productProjections()
        .search()
        .get({
          queryArgs: {
            sort: ["lastModifiedAt asc", "id asc"],
            limit,
            expand: "categories[*].ancestors[*]",
            "filter.query": filter,
          },
        })
        .execute();
      const results = response.body.results.filter((product) => {
        const already = get(product.id);
        set(product.id);
        return !already;
      });
      await writeProducts({
        results: results,
        productStream,
      });
      if (results.length === 0) {
        productStream.end();
        return;
      }
      recur(
        productStream,
        results.slice(-1)[0].lastModifiedAt,
        lastModifiedAtTo
      );
    } catch (e: unknown) {
      productStream.write(["FAIL", (e as Error).message]);
    }
  };
  return recur(productStream, lastModifiedAtFrom, lastModifiedAtTo);
}
