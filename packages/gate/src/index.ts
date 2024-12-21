import { Policy } from "./core/policy";

export * from "./core/gate";
export * from "./core/policy";
export * from "./types/guard";

export const createPolicy = <
  T extends string,
  E = unknown,
  R = unknown,
  Arg = unknown
>(
  name: string,
  actions: Record<T, (representative: R, entity: E, ...args: Arg[]) => boolean>
): Policy<T> => {
  const policy = new Policy<T>(name);
  Object.entries(actions).forEach(([action, restriction]) =>
    policy.define(action as T, restriction as any)
  );
  return policy;
};
