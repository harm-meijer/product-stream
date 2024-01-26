import { FILE_WRITE_CONCURRENT, FILE_WRITE_PERIOD } from "../constants";
import createRateLimit from "./createRateLimit";

export const limitFileWrite = createRateLimit(
  FILE_WRITE_CONCURRENT,
  FILE_WRITE_PERIOD
);
