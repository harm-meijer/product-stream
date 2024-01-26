import { getApiRoot } from "../lib/client";
import { Product, StandalonePrice } from "@commercetools/platform-sdk";

async function expandPrices(product: Product) {
  if (product.priceMode !== "Standalone") {
    return product;
  }
  const variants = [
    product.masterData.current.masterVariant,
    ...product.masterData.current.variants,
  ];
  const prices = await getPrices(
    variants.map(({ sku }) => sku).filter((sku) => Boolean(sku)) as string[]
  );
  variants.forEach((variant) => {
    if (!variant.sku) {
      return;
    }
    const price = prices.get(variant.sku);
    if (price) {
      //@ts-ignore (cannot mutate)
      variant.prices = price;
    }
  });
  return product;
}

async function getPrices(skus: string[]) {
  //@todo: get all
  const prices = await getApiRoot()
    .standalonePrices()
    .get({
      queryArgs: {
        sort: "id asc",
        limit: 200,
        where: `sku in (${skus.map((sku) => `"${sku}"`)})`,
      },
    })
    .execute();
  return prices.body.results.reduce((acc, price) => {
    acc.set(price.sku, (acc.get(price.sku) || []).concat(price));
    return acc;
  }, new Map<string, StandalonePrice[]>());
}
export default expandPrices;
