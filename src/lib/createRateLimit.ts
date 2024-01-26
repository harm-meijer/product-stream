import { later } from "./later";

type Listener = () => void;
class Store {
  #subscriptions: Listener[] = [];
  public subscribe(fn: Listener) {
    this.#subscriptions.push(fn);
  }
  public finishedAsync() {
    this.#subscriptions[0] && this.#subscriptions[0]();
    this.#subscriptions.shift();
  }
}

type Fn<ARG, RET> = (arg: ARG) => Promise<RET>;
export type RatePeriod = [max: number, periodInMilliseconds: number];
function createRateLimit(
  concurrent: number,
  [maxInPeriod, periodInMilliseconds]: RatePeriod
) {
  return function withRate<ARG, RET>(fn: Fn<ARG, RET>) {
    const activeInPeriod: number[] = [];
    let concurrentlyActive = 0;
    const store = new Store();
    function done() {
      concurrentlyActive--;
      activeInPeriod.shift();
      store.finishedAsync();
    }
    function start(now: number) {
      concurrentlyActive++;
      activeInPeriod.push(now);
    }
    async function recur(arg: ARG): Promise<RET> {
      const now = Date.now();
      for (let i = 0; i < activeInPeriod.length; i++) {
        if (activeInPeriod[i] < now - periodInMilliseconds) {
          activeInPeriod.shift();
        } else {
          break;
        }
      }
      // console.log("active in period", activeInPeriod);
      if (activeInPeriod.length >= maxInPeriod) {
        console.log(
          "too many active, wait",
          arg,
          "wait for:",
          activeInPeriod[0] + periodInMilliseconds - now
        );
        return later(activeInPeriod[0] + periodInMilliseconds - now).then(() =>
          recur(arg)
        );
      }
      if (concurrentlyActive < concurrent) {
        console.log("starging:", arg);
        start(now);
        const promise = fn(arg);
        promise.finally(() => {
          console.log("done:", arg);
          done();
        });
        return promise;
      }
      return new Promise((resolve) => {
        console.log("creating promise, too many concurrent", arg);
        store.subscribe(async () => {
          console.log("subscription triggered:", arg);
          const val = await recur(arg);
          console.log("resolving:", val);
          resolve(val);
        });
      });
    }
    return (arg: ARG) => {
      return recur(arg);
    };
  };
}
export default createRateLimit;
