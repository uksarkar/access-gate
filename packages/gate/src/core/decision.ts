import { PolicyAction, PolicyActionMapTuple } from "src/types/action.js";
import {
  evaluateAsyncGuards,
  evaluateGuards
} from "../helpers/guard-evaluator.js";
import { isUndefined } from "../helpers/util.js";
import type { AsyncLazyGuard, LazyGuard } from "../types/guard.js";

export default class Decision<T extends PolicyActionMapTuple> {
  private readonly _has_action: boolean;
  private _dependencies: Record<string, unknown>;

  public constructor(
    private _lazy_guards: LazyGuard[],
    private _lazy_async_guards: AsyncLazyGuard[],
    private readonly _representative: unknown,
    private _conclusion: boolean | undefined,
    private _allow_default: boolean,
    private _has_policy: boolean,
    private _is_guard_decision: boolean,
    private readonly restriction?: PolicyAction<T>,
    hasAction?: boolean,
    dependencies?: Record<string, unknown>
  ) {
    this._has_action = hasAction ?? !!this.restriction;
    this._dependencies = { ...(dependencies || {}) };
  }

  public get passedDefault(): boolean {
    return this._allow_default && (!this._has_policy || !this.hasAction);
  }

  public get conclusion(): boolean {
    return this._conclusion ?? this.passedDefault;
  }

  public get hasPolicy(): boolean {
    return this._has_policy;
  }

  public get hasAction(): boolean {
    return this._has_action;
  }

  public get isGuardDecision(): boolean {
    return this._is_guard_decision;
  }

  public can(entity?: T[1], ...args: T[2][]): boolean {
    const lazyGuardDecision = this.getGuardDecision(entity);
    if (!isUndefined(lazyGuardDecision)) {
      this._conclusion = lazyGuardDecision;
      return lazyGuardDecision;
    }
    return this.applyRestriction(entity, args);
  }

  public async could(entity?: T[1], ...args: T[2][]): Promise<boolean> {
    const lazyGuardDecision = this.getGuardDecision(entity);
    if (!isUndefined(lazyGuardDecision)) {
      this._conclusion = lazyGuardDecision;
      return lazyGuardDecision;
    }

    const lazyAsyncGuardDecision = await evaluateAsyncGuards(
      this._lazy_async_guards,
      this._representative,
      entity,
      (k: string, d: unknown) => {
        this._dependencies[k] = d;
      }
    );
    if (!isUndefined(lazyAsyncGuardDecision)) {
      this._conclusion = lazyAsyncGuardDecision;
      return lazyAsyncGuardDecision;
    }

    return this.applyRestriction(entity, args);
  }

  public allowDefault(): this {
    this._allow_default = true;
    return this;
  }

  public denyDefault(): this {
    this._allow_default = false;
    return this;
  }

  private applyRestriction(entity: unknown, args: unknown[]) {
    if (this.passedDefault) {
      return true;
    }

    if (!this.restriction) {
      this._conclusion = this._allow_default;
    } else {
      this._conclusion = this.restriction.call(
        { inject: (name: string) => this._dependencies?.[name] },
        this._representative,
        entity,
        ...args
      );
    }

    return this._conclusion;
  }

  private getGuardDecision(entity: unknown) {
    if (this.isGuardDecision) {
      return this.conclusion;
    }

    return evaluateGuards(
      this._lazy_guards,
      this._representative,
      entity,
      (k: string, d: unknown) => {
        this._dependencies[k] = d;
      }
    );
  }
}
