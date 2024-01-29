import { Product } from "@commercetools/platform-sdk";
import { getApiRoot } from "../lib/client";

async function createStandAlonePrices(product: Product) {
  const variants = [
    product.masterData.current.masterVariant,
    ...product.masterData.current.variants,
  ];
  await Promise.all(
    variants
      .map((variant) =>
        (variant.prices || []).map((price) =>
          getApiRoot()
            .standalonePrices()
            .post({
              body: { ...price, sku: variant.sku as string },
            })
            .execute()
            .catch((e) => {
              if (
                e?.body?.message.startsWith("Duplicate standalone price scope ")
              ) {
                return;
              }
              throw e;
            })
        )
      )
      .flat()
  );
  return product;
}
export default createStandAlonePrices;
