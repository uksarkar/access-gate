import { GuardContainer } from "./guard-registry.js";
import { isUndefined } from "../helpers/util.js";
import { Policy } from "./policy.js";
import { Representative } from "./representative.js";
import type { PolicyActionMap } from "src/types/action.js";

export class Gate<
  P extends Record<string, PolicyActionMap<any, any, any, any>>
> extends GuardContainer {
  private _policies: {
    [K in Extract<keyof P, string>]: Policy<P[K], K>;
  } = {} as any;

  public addPolicy<K extends Extract<keyof P, string>>(
    policy: Policy<P[K], K>
  ) {
    this._policies[policy.name] = policy;
  }

  public get policies() {
    return this._policies;
  }

  public build<R extends unknown>(representative: R) {
    const [guardDecision, dependencies] = this.evaluateGuards(representative);
    return new Representative(
      this,
      representative,
      guardDecision,
      dependencies
    );
  }

  public async buildAsync<R extends unknown>(representative: R) {
    let [guardDecision, dependencies] = this.evaluateGuards(representative);

    // when not having any decision yet
    // then chain further
    if (isUndefined(guardDecision)) {
      const [asyncDecision, asyncDep] =
        await this.evaluateAsyncGuards(representative);
      guardDecision = asyncDecision;
      dependencies = Object.assign(dependencies, asyncDep);
    }

    return new Representative(
      this,
      representative,
      guardDecision,
      dependencies
    );
  }
}
