import { Product } from "@commercetools/platform-sdk";
import { getApiRoot } from "../lib/client";

async function removeInDocumentPrices(product: Product) {
  const variants = [
    product.masterData.current.masterVariant,
    ...product.masterData.current.variants,
  ];
  return await variants.reduce(async (acc: Promise<unknown>, variant) => {
    await acc;
    const req = await await getApiRoot()
      .products()
      .withId({ ID: product.id })
      .get()
      .execute();
    return getApiRoot()
      .products()
      .withId({ ID: product.id })
      .post({
        body: {
          version: req.body.version,
          actions: (variant.prices || []).map((price) => ({
            action: "removePrice",
            priceId: price.id,
            staged: false,
          })),
        },
      })
      .execute();
  }, Promise.resolve());
}
export default removeInDocumentPrices;
