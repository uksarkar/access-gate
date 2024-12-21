import { GuardContainer } from "./guard-registry";
import { isUndefined } from "../helpers/util";
import { Policy } from "./policy";
import { Representative } from "./representative";

export class Gate<P extends Record<string, string[]>> extends GuardContainer {
  private _policies: { [K in keyof P]: Policy<P[K][number]> } = {} as any;

  public addPolicy<K extends keyof P>(policy: Policy<P[K][number]>) {
    this._policies[policy.name as K] = policy;
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
