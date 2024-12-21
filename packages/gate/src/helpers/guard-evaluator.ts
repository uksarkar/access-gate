import { AsyncGuard, AsyncLazyGuard, Guard, LazyGuard } from "../types";

type Injector = (name: string, dep: unknown) => void;

export function evaluateGuards<R = unknown, E = unknown>(
  guards: Guard[],
  representative: R,
  inject: Injector
): boolean | undefined;
export function evaluateGuards<R = unknown, E = unknown>(
  guards: LazyGuard[],
  representative: R,
  entity: E,
  inject: Injector
): boolean | undefined;
export function evaluateGuards<R = unknown, E = unknown>(
  guards: (Guard | LazyGuard)[],
  representative: R,
  entity: E,
  inject?: Injector
): boolean | undefined {
  for (const guard of guards) {
    const decision = guard(representative, entity as any, inject as any);
    if (typeof decision !== "undefined") {
      return decision;
    }
  }
}

export function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: AsyncGuard[],
  representative: R,
  inject: Injector
): Promise<boolean | undefined>;
export function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: AsyncLazyGuard[],
  representative: R,
  entity: E,
  inject: Injector
): Promise<boolean | undefined>;
export async function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: (AsyncGuard | AsyncLazyGuard)[],
  representative: R,
  entity: E | Injector,
  inject?: Injector
) {
  for await (const guard of guards) {
    const decision = await guard(representative, entity as any, inject as any);
    if (typeof decision !== "undefined") {
      return decision;
    }
  }
}
