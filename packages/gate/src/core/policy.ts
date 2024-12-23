import { GuardContainer } from "./guard-registry.js";

export class Policy<T extends string, A extends string> extends GuardContainer {
  private _actions: Record<A, <Arg>(...args: Arg[]) => boolean>;

  constructor(public readonly name: T) {
    super();
    this._actions = {} as Record<A, <Arg>(...args: Arg[]) => boolean>;
  }

  public get actions() {
    return this._actions;
  }

  /**
   * define
   */
  public define<E = unknown, R = unknown, Arg = unknown>(
    action: A,
    restriction: (
      this: { inject: <D>(name: string) => D },
      representative: R,
      entity: E,
      ...args: Arg[]
    ) => boolean
  ) {
    this._actions[action] = restriction as any;
  }

  public getGuardDecision(representative: unknown) {
    return this.evaluateGuards(representative);
  }

  public getAsyncGuardDecision(representative: unknown) {
    return this.evaluateAsyncGuards(representative);
  }
}
