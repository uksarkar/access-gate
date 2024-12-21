import type { AsyncGuard, AsyncLazyGuard, Guard, LazyGuard } from "../types/guard.js";
import {
  evaluateAsyncGuards,
  evaluateGuards
} from "../helpers/guard-evaluator.js";

export abstract class GuardContainer {
  private _guards: Guard[] = [];
  private _lazy_guards: LazyGuard[] = [];
  private _async_guards: AsyncGuard[] = [];
  private _async_lazy_guards: AsyncLazyGuard[] = [];

  public guard<R = unknown>(g: Guard<R>) {
    this._guards.push(g as any);
  }

  public lazyGuard<R = unknown, E = unknown>(g: LazyGuard<R, E>) {
    this._lazy_guards.push(g as any);
  }

  public asyncGuard<R = unknown>(g: AsyncGuard<R>) {
    this._async_guards.push(g as any);
  }

  public asyncLazyGuard<R = unknown, E = unknown>(g: AsyncLazyGuard<R, E>) {
    this._async_lazy_guards.push(g as any);
  }

  public get lazyGuards() {
    return this._lazy_guards;
  }

  public get asyncLazyGuards() {
    return this._async_lazy_guards;
  }

  protected evaluateGuards(
    representative: unknown
  ): [boolean | undefined, Record<string, unknown>] {
    const dependencies = {} as Record<string, unknown>;
    const guardDecision = evaluateGuards(
      this._guards,
      representative,
      (key: string, dep: unknown) => {
        dependencies[key] = dep;
      }
    );

    return [guardDecision, dependencies];
  }

  protected async evaluateAsyncGuards(
    representative: unknown
  ): Promise<[boolean | undefined, Record<string, unknown>]> {
    const dependencies = {} as Record<string, unknown>;
    const guardDecision = await evaluateAsyncGuards(
      this._async_guards,
      representative,
      (key: string, dep: unknown) => {
        dependencies[key] = dep;
      }
    );

    return [guardDecision, dependencies];
  }
}
