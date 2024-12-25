import { Policy } from "./core/policy.js";
import { PolicyAction, PolicyActionMap } from "./types/action.js";

export * from "./core/gate.js";
export * from "./core/policy.js";
export * from "./types/guard.js";
export * from "./types/action";

/**
 * A utility function to create a new `Policy` object without directly using the `Policy` class.
 * This provides a more concise and type-safe way to define policies.
 *
 * @template T - A string representing the name of the policy.
 * @template ActionMap - A map of actions representing the policy's behavior.
 *
 * @param name - The name of the policy, typically a string identifier.
 * @param actions - An object mapping action keys to their corresponding `PolicyAction` definitions.
 *                  Each key in `actions` corresponds to a policy action described by the `ActionMap`.
 *
 * @returns A new `Policy` object initialized with the provided name and actions.
 *
 * @example
 * type PostPolicy = {
 *   update: PolicyActionMapTuple<User, Post>;
 *   delete: PolicyActionMapTuple<User>;
 * };
 *
 * const gate = new Gate<{ post: PostPolicy }>();
 *
 * // Define policies
 * const postPolicy = createPolicy<PostPolicy, "post">("post", {
 *   update: (user: User, post: Post) => {
 *     return user.role.includes("admin") || user.id === post?.authorId;
 *   },
 *   delete: (user: User) => {
 *     return user.role.includes("admin");
 *   }
 * });
 *
 * // Register the policy with the gate
 * gate.addPolicy("post", postPolicy);
 */
export const createPolicy = <
  ActionMap extends PolicyActionMap<any, any, any, any>,
  T extends string
>(
  name: T,
  actions: { [K in keyof ActionMap]: PolicyAction<ActionMap[K]> }
): Policy<ActionMap, T> => {
  return new Policy<ActionMap, T>(name, actions);
};
