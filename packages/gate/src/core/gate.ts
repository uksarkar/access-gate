import { GuardContainer } from "./guard-registry.js";
import { isUndefined } from "../helpers/util.js";
import { Policy } from "./policy.js";
import { Representative } from "./representative.js";

export class Gate<P extends Record<string, string[]>> extends GuardContainer {
  private _policies: { [K in Extract<keyof P, string>]: Policy<K, P[K][number]> } = {} as any;

  public addPolicy<K extends Extract<keyof P, string>>(policy: Policy<K, P[K][number]>) {
    this._policies[policy.name] = policy;
  }

  public get policies() {
    return this._policies;
  }

  public build<R = unknown>(representative: R) {
    const [guardDecision, dependencies] = this.evaluateGuards(representative);
    return new Representative(
      this,
      representative,
      guardDecision,
      dependencies
    );
  }

  public async buildAsync<R = unknown>(representative: R) {
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
