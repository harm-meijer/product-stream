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
  const standAlonePrices = await getPrices(
    variants.map(({ sku }) => sku).filter((sku) => Boolean(sku)) as string[]
  );
  variants.forEach((variant) => {
    const standalonePricesForSKU = standAlonePrices.get(variant?.sku as string);
    if (standalonePricesForSKU) {
      //@ts-ignore (cannot mutate)
      variant.prices = (variant.prices || []).concat(standalonePricesForSKU);
    }
  });
  return product;
}

async function getPrices(
  skus: string[],
  lastId?: string,
  pricesMap = new Map<string, StandalonePrice[]>()
): Promise<Map<string, StandalonePrice[]>> {
  if (skus.length === 0) {
    return pricesMap;
  }
  const where = [`sku in (${skus.map((sku) => `"${sku}"`)})`];
  if (lastId) {
    where.push(`id > "${lastId}"`);
  }
  const prices = await getApiRoot()
    .standalonePrices()
    .get({
      queryArgs: {
        sort: "id asc",
        limit: 200,
        where,
      },
    })
    .execute();
  prices.body.results.forEach((price) => {
    pricesMap.set(price.sku, (pricesMap.get(price.sku) || []).concat(price));
  });
  if (prices.body.results.length === prices.body.total) {
    return pricesMap;
  }
  return getPrices(skus, prices.body.results.slice(-1)[0].id, pricesMap);
}
export default expandPrices;
