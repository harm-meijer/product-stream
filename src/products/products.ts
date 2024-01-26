import { CONCURRENTLY_ACTIVE } from "../constants";
import active from "../lib/Store";
import { getApiRoot } from "../lib/client";
import { Product } from "@commercetools/platform-sdk";

function limited(product: Product) {
  if (active.getSnapshot() > CONCURRENTLY_ACTIVE) {
    return new Promise<Product>((resolve) => {
      const cleanup = active.subscribe(() => {
        resolve(product);
        cleanup();
      });
    });
  }
  return product;
}

export default (lastModifiedAt?: string, firstCall = true) => {
  const products: Product[] = [];
  let done = false;
  return async function get(): Promise<Product | null> {
    const product = products.shift();
    if (done) {
      return null;
    }
    if (firstCall || products.length === 0) {
      firstCall = false;
      const productSet = await getProductSet([lastModifiedAt, product?.id]);
      //@todo: uncomment above and remove line below
      // const productSet = await getProductSet([
      //   lastModifiedAt,
      //   // product?.id || "1b48fb11-daf3-4dff-8692-79d01dd449e1", //one item
      //   // product?.id || "0e0efe41-6130-49ff-a3e6-1601df174518", // 3 titems
      //   // product?.id || "3c3224b5-35a9-4eff-a424-ed6a36fdd645", // no items
      //   product?.id || "564972bc-a1b0-45fc-9243-78edc64d4579", // 38 items
      // ]);
      if (productSet.length === 0) {
        done = true;
        if (product) {
          return limited(product);
        }
      }
      products.push(...productSet);
      return get();
    }
    return limited(product as Product);
  };
};

const getProductSet = async ([lastModifiedAt, lastId]: [
  lastModifiedAt?: string,
  lastId?: string
]): Promise<Product[]> => {
  //@note: if you only want published changes you can add 1 items to the where
  //  array: "masterData(published=true)"
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
        limit: 200,
        expand: "masterData.current.categories[*].ancestors[*]",
        where,
      },
    })
    .execute();
  return response.body.results;
};
