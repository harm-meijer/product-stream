import { Product } from "@commercetools/platform-sdk";
import { getApiRoot } from "../lib/client";

async function setPriceMode(product: Product) {
  const req = await getApiRoot()
    .products()
    .withId({ ID: product.id })
    .get()
    .execute();
  const p = await getApiRoot()
    .products()
    .withId({ ID: product.id })
    .post({
      body: {
        version: req.body.version,
        actions: [
          {
            action: "setPriceMode",
            priceMode: "Standalone",
          },
        ],
      },
    })
    .execute();
  return p.body;
}
export default setPriceMode;
