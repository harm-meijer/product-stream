import { Product } from "@commercetools/platform-sdk";
import { PassThrough } from "stream";
import { Result } from "../types";

const createProductProcessor = () => {
  return new PassThrough({
    objectMode: true,
    transform(chunk: Result<Product | unknown>, enc, callback) {
      if (chunk[0] === "FAIL") {
        return callback(null, chunk);
      }
      const product = chunk[1] as Product;
      //do async stuff with product
      Promise.resolve(product).then(
        (product) => callback(null, ["SUCCESS", { id: product.id }]),
        (error) => callback(null, ["FAIL", error])
      );
    },
  });
};
export default createProductProcessor;
