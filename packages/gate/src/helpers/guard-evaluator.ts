import type { AsyncGuard, AsyncLazyGuard, Guard, LazyGuard } from "../types/guard.js";

type Provider = (name: string, dep: unknown) => void;

export function evaluateGuards<R = unknown, E = unknown>(
  guards: Guard[],
  representative: R,
  provide: Provider
): boolean | undefined;
export function evaluateGuards<R = unknown, E = unknown>(
  guards: LazyGuard[],
  representative: R,
  entity: E,
  provide: Provider
): boolean | undefined;
export function evaluateGuards<R = unknown, E = unknown>(
  guards: (Guard | LazyGuard)[],
  representative: R,
  entity: E,
  provide?: Provider
): boolean | undefined {
  for (const guard of guards) {
    const decision = guard(representative, entity as any, provide as any);
    if (typeof decision !== "undefined") {
      return decision;
    }
  }
}

export function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: AsyncGuard[],
  representative: R,
  provide: Provider
): Promise<boolean | undefined>;
export function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: AsyncLazyGuard[],
  representative: R,
  entity: E,
  provide: Provider
): Promise<boolean | undefined>;
export async function evaluateAsyncGuards<R = unknown, E = unknown>(
  guards: (AsyncGuard | AsyncLazyGuard)[],
  representative: R,
  entity: E | Provider,
  provide?: Provider
) {
  for await (const guard of guards) {
    const decision = await guard(representative, entity as any, provide as any);
    if (typeof decision !== "undefined") {
      return decision;
    }
  }
}
