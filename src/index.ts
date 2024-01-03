import { Transform } from "stream";
import createProductReadStream from "./lib/productStream";
import createProductProcessor from "./lib/createProductProcessor";

const main = async () => {
  const errorFilter = new Transform({
    objectMode: true,
    transform(chunk, enc, callback) {
      if (chunk[0] === "FAIL") {
        callback(null, chunk[1]);
        return;
      }
      callback(null);
    },
  });
  const successFilter = new Transform({
    objectMode: true,
    transform(chunk, enc, callback) {
      if (chunk[0] === "SUCCESS") {
        callback(null, chunk[1]);
        return;
      }
      callback(null);
    },
  });
  let counter = 0;
  const processStream = createProductReadStream().pipe(
    createProductProcessor()
  );
  const errorStream = processStream.pipe(errorFilter);
  const successStream = processStream.pipe(successFilter);
  processStream.on("data", () => {
    //can update a progress bar here
    counter++;
  });
  const errors: unknown[] = [];
  errorStream.on("data", (error) => {
    errors.push(error);
  });
  successStream.on("data", (...args) => {
    console.log("finished with:", args);
  });
  processStream.on("close", () => {
    if (errors.length) {
      console.error("errors:", errors.length);
    }
    console.log("stream closed", counter);
  });
};
main();
