import type { PolicyAction, PolicyActionMap } from "src/types/action.js";
import { GuardContainer } from "./guard-registry.js";

export class Policy<
  ActionMap extends PolicyActionMap<any, any, any, any>,
  T extends string
> extends GuardContainer {
  constructor(
    public readonly name: T,
    private _actions: Partial<{
      [K in keyof ActionMap]: PolicyAction<ActionMap[K]>;
    }> = {}
  ) {
    super();
  }

  public get actions() {
    return this._actions;
  }

  /**
   * Define an action with a restriction.
   */
  public define<K extends keyof ActionMap>(
    action: K,
    restriction: PolicyAction<ActionMap[K]>
  ) {
    this._actions[action] = restriction;
  }

  public getGuardDecision(representative: unknown) {
    return this.evaluateGuards(representative);
  }

  public getAsyncGuardDecision(representative: unknown) {
    return this.evaluateAsyncGuards(representative);
  }
}
