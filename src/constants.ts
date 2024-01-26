import { RatePeriod } from "./lib/createRateLimit";

export const CONCURRENTLY_ACTIVE = 200;
// COCO_CONCURRENT=x where x is amount of concurrent connections to coco
export const FILE_WRITE_CONCURRENT = 200;
//COCO_RATE_PERIOD = [x,y] where x amount in y milliseconds
export const FILE_WRITE_PERIOD = [1000, 1000] as RatePeriod;
