type Listener = (active: number) => void;
class Store {
  #subscriptions = new Map<Listener, Listener>();
  #state: number;
  constructor(state: number) {
    this.#state = state;
  }
  public subscribe(fn: Listener) {
    this.#subscriptions.set(fn, fn);
    return () => {
      this.#subscriptions.delete(fn);
    };
  }
  public getSnapshot() {
    return this.#state;
  }
  public dispatch(action: number) {
    this.#state = action;
    this.#subscriptions.forEach((subscription) => subscription(this.#state));
  }
}
export default new Store(0);
