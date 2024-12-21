import { GuardContainer } from "./guard-registry";

export class Policy<T extends string> extends GuardContainer {
  private _actions: Record<T, <Arg>(...args: Arg[]) => boolean>;

  constructor(public readonly name: string) {
    super();
    this._actions = {} as Record<T, <Arg>(...args: Arg[]) => boolean>;
  }

  public get actions() {
    return this._actions;
  }

  /**
   * define
   */
  public define<E = unknown, R = unknown, Arg = unknown>(
    action: T,
    restriction: (representative: R, entity: E, ...args: Arg[]) => boolean
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
