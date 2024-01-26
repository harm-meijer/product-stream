import { COCO_CONCURRENT, COCO_RATE_PERIOD } from "../constants";
import createRateLimit from "./createRateLimit";

export const limitCoCo = createRateLimit(COCO_CONCURRENT, COCO_RATE_PERIOD);
