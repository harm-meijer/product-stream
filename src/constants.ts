import { RatePeriod } from "./lib/createRateLimit";

export const CONCURRENTLY_ACTIVE = 1000;
// COCO_CONCURRENT=x where x is amount of concurrent connections to coco
export const COCO_CONCURRENT = 100;
//COCO_RATE_PERIOD = [x,y] where x amount in y milliseconds
export const COCO_RATE_PERIOD = [5000, 1000] as RatePeriod;
