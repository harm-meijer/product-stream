import products from "./products/products";
import active from "./lib/Store";
import { later } from "./lib/later";

const main = async () => {
  const get = products();
  const result = [];
  while (true) {
    active.dispatch(active.getSnapshot() + 1);
    const item = await get();
    console.log("item is", item === null, item?.id);
    if (item === null) {
      break;
    }
    result.push(item);
    //@todo:setting standalone prices
    //@todo: make a syncTo processor
    //@todo: rate limit the coco and syncIn api method
    later().finally(() => {
      active.dispatch(active.getSnapshot() - 1);
    });
  }
  console.log("length:", result.length);

  console.log("finished .....");
};
main();
