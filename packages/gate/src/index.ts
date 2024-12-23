import { Policy } from "./core/policy.js";

export * from "./core/gate.js";
export * from "./core/policy.js";
export * from "./types/guard.js";

export const createPolicy = <
  T extends string,
  E = unknown,
  R = unknown,
  Arg = unknown
>(
  name: string,
  actions: {
    [K in T]: (
      this: { inject: <D>(name: string) => D },
      representative: R,
      entity: E,
      ...args: Arg[]
    ) => boolean;
  }
): Policy<T> => {
  const policy = new Policy<T>(name);
  Object.entries(actions).forEach(([action, restriction]) =>
    policy.define(action as T, restriction as any)
  );
  return policy;
};
