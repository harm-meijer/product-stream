import { Product } from "@commercetools/platform-sdk";
import { promises as fs } from "node:fs";

async function saveToFile(product: Product) {
  await fs.writeFile(
    `./product-files/${product.id}.json`,
    JSON.stringify(product, undefined, 2),
    "utf-8"
  );
}

export default saveToFile;
