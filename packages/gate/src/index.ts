import { Policy } from "./core/policy.js";

export * from "./core/gate.js";
export * from "./core/policy.js";
export * from "./types/guard.js";

/**
 * Creates a new instance of the `Policy` class.
 * 
 * This utility function simplifies the process of creating a policy by allowing
 * you to define a set of actions and their corresponding restrictions in a single step.
 * The resulting policy can then be added directly to a `Gate`.
 *
 * @template T - A string representing the entity name (e.g., "user", "post").
 * @template A - A string union representing the action names (e.g., "create", "update").
 * @template E - The entity type the policy applies to (default: `unknown`).
 * @template R - The representative type (default: `unknown`).
 * @template Arg - Additional argument types for the restriction functions (default: `unknown`).
 *
 * @param name - The name of the policy (e.g., "user", "post").
 * @param actions - An object defining actions and their corresponding restrictions.
 *                  Each restriction is a function that takes:
 *                  - `representative`: The representative being evaluated.
 *                  - `entity`: The entity the action applies to.
 *                  - `...args`: Additional arguments specific to the action.
 *                  The restriction function returns a boolean indicating whether
 *                  the action is allowed (`true`) or denied (`false`).
 *
 * @returns A new instance of the `Policy<T, A>` class that can be added to a `Gate<{[k: T]: A}>`.
 *
 * @example
 * const userPolicy = createPolicy("user", {
 *   create: (rep) => rep.role === "admin",
 *   update: (rep, user) => rep.id === user.id || rep.role === "admin"
 * });
 * 
 * gate.addPolicy(userPolicy);
 */
export const createPolicy = <
  T extends string,
  A extends string,
  E = unknown,
  R = unknown,
  Arg = unknown
>(
  name: T,
  actions: {
    [K in A]: (
      this: { inject: <D>(name: string) => D },
      representative: R,
      entity: E,
      ...args: Arg[]
    ) => boolean;
  }
): Policy<T, A> => {
  const policy = new Policy<T, A>(name);
  Object.entries(actions).forEach(([action, restriction]) =>
    policy.define(action as A, restriction as any)
  );
  return policy;
};
