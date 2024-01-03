import { getApiRoot } from "./client";
import { PassThrough } from "stream";
import { Product } from "@commercetools/platform-sdk";
import { later } from "./lib";
//@ts-ignore
export default () => {
  const productStream = new PassThrough({
    objectMode: true,
    highWaterMark: 200,
  });
  recur(
    productStream,
    //fetching products modified in the last hour
    new Date(Date.now() - 60 * 60 * 1000).toISOString()
  );

  return productStream;
};
type WriteProductsArg = {
  results: Product[];
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

const recur = async (
  productStream: PassThrough,
  lastModifiedAt?: string,
  lastId?: string
) => {
  try {
    //@note: if you only want published changes you can add 2 items to the where
    //  array, the lastModifiedAt and "masterData(published=true)"
    const where: string[] = lastModifiedAt
      ? [`lastModifiedAt > "${lastModifiedAt}"`]
      : [];
    if (lastId) {
      where.push(`id > "${lastId}"`);
    }
    const response = await getApiRoot()
      .products()
      .get({
        queryArgs: {
          sort: "id asc",
          limit: 20,
          where,
        },
      })
      .execute();
    const results = response.body.results;
    await writeProducts({
      results: results,
      productStream,
    });
    if (results.length === 0) {
      productStream.end();
      return;
    }
    recur(productStream, lastModifiedAt, results.slice(-1)[0].id);
  } catch (e: unknown) {
    productStream.write(["FAIL", (e as Error).message]);
  }
};
