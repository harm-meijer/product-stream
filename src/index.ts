import products from "./products/products";
import active from "./lib/Store";
import expandPrices from "./products/expandPrices";
import setPriceMode from "./products/setPriceMode";
import createStandAlonePrices from "./products/createStandAlonePrices";
import removeInDocumentPrices from "./products/removeInDocumentPrices";

const main = async () => {
  const get = products();
  const result = [];
  while (true) {
    active.dispatch(active.getSnapshot() + 1);
    const product = await get();
    if (product === null) {
      break;
    }
    result.push(product);
    setPriceMode(product)
      .then(createStandAlonePrices)
      .then(removeInDocumentPrices)
      .finally(() => active.dispatch(active.getSnapshot() - 1));
    console.log("processed:", result.length);
  }
  console.log("total products:", result.length);
  console.log("finished .....");
};
main();
