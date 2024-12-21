import Decision from "./decision";
import type { Gate } from "./gate";
import { isUndefined } from "../helpers/util";
import { Policy } from "./policy";

export class Representative<
  P extends Record<string, string[]>,
  T extends unknown
> {
  public constructor(
    private readonly gate: Gate<P>,
    private readonly entity: T,
    private _guard_decision: boolean | undefined,
    private _dependencies: Record<string, unknown>
  ) {}

  public get hasGuardDecision(): boolean {
    return !isUndefined(this._guard_decision);
  }

  public get guardDecision(): boolean | undefined {
    return this._guard_decision;
  }

  public access<K extends keyof P, A extends P[K][number]>(
    policy: K,
    action: A
  ) {
    const foundPolicy = this.gate.policies[policy];
    const guardDecision = this.getGuardDecision(foundPolicy);

    return this.constructDecision(foundPolicy, action, guardDecision);
  }

  public async asyncAccess<K extends keyof P, A extends P[K][number]>(
    policy: K,
    action: A
  ) {
    const foundPolicy = this.gate.policies[policy];
    const guardDecision = this.getGuardDecision(foundPolicy);

    // break the chain if already have any decision
    // or no policy found
    if ((guardDecision && !isUndefined(guardDecision[0])) || !foundPolicy) {
      return this.constructDecision(foundPolicy, action, guardDecision);
    }

    let [decision, dep] = await foundPolicy.getAsyncGuardDecision(this.entity);
    return this.constructDecision(foundPolicy, action, [
      decision,
      { ...((guardDecision && guardDecision[1]) || {}), ...dep }
    ]);
  }

  private constructDecision(
    policy: Policy<string> | undefined,
    action: string,
    guardDecision: ReturnType<typeof this.getGuardDecision>
  ) {
    if (guardDecision && !isUndefined(guardDecision[0])) {
      return new Decision(
        [],
        [],
        undefined,
        !!guardDecision[0],
        !!guardDecision[0],
        !!policy,
        true,
        undefined,
        !!policy?.actions[action]
      );
    }

    return new Decision(
      [...this.gate.lazyGuards, ...(policy?.lazyGuards || [])],
      [...this.gate.asyncLazyGuards, ...(policy?.asyncLazyGuards || [])],
      this.entity,
      false,
      false,
      !!policy,
      false,
      policy?.actions[action],
      undefined,
      { ...this._dependencies, ...((guardDecision && guardDecision[1]) || {}) }
    );
  }

  private getGuardDecision(
    policy?: Policy<string>
  ):
    | undefined
    | [boolean | undefined]
    | [boolean | undefined, Record<string, unknown>] {
    if (this.hasGuardDecision) {
      return [this.guardDecision];
    }

    if (!policy) {
      return undefined;
    }

    return policy.getGuardDecision(this.entity);
  }
}
