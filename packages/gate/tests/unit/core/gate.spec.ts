import { assert, describe, it } from "vitest";
import { Gate } from "../../../src/core/gate";
import { Policy } from "../../../src/core/policy";
import { Representative } from "../../../src/core/representative";
import { DefinePolicyActions, PolicyActionMapTuple } from "src/types/action";

describe("Gate class", () => {
  type MockPolicies = {
    user: DefinePolicyActions<
      ["create", "update", "delete"],
      PolicyActionMapTuple
    >;
    post: DefinePolicyActions<["view", "edit", "delete"], PolicyActionMapTuple>;
  };

  it("Adds and retrieves policies", () => {
    const gate = new Gate<MockPolicies>();
    const userPolicy = new Policy("user");

    gate.addPolicy(userPolicy);
    assert.equal(gate.policies.user, userPolicy);
    assert.isUndefined(gate.policies.post); // Post policy not added yet
  });

  it("Creates a Representative with guard decision", () => {
    const gate = new Gate<MockPolicies>();
    const userPolicy = new Policy("user");
    gate.addPolicy(userPolicy);

    gate.guard(() => true); // Global guard returns true

    const representative = gate.build({ id: 1 });
    assert.instanceOf(representative, Representative);
    assert.isTrue(representative.guardDecision);
  });

  it("Handles undefined guard decisions in Representative", () => {
    const gate = new Gate<MockPolicies>();
    const userPolicy = new Policy("user");
    gate.addPolicy(userPolicy);

    gate.guard(() => undefined); // Guard returns undefined

    const representative = gate.build({ id: 1 });
    assert.instanceOf(representative, Representative);
    assert.isUndefined(representative.guardDecision);
  });

  it("Creates a Representative with async guard decisions", async () => {
    const gate = new Gate<MockPolicies>();
    const postPolicy = new Policy("post");
    gate.addPolicy(postPolicy);

    gate.asyncGuard(async () => true); // Async global guard returns true

    const representative = await gate.buildAsync({ id: 2 });
    assert.instanceOf(representative, Representative);
    assert.isTrue(representative.guardDecision);
  });

  it("Chains async and sync guards", async () => {
    const gate = new Gate<MockPolicies>();
    const userPolicy = new Policy("user");
    gate.addPolicy(userPolicy);

    gate.guard(() => undefined); // Sync guard returns undefined
    gate.asyncGuard(async () => false); // Async guard returns false

    const representative = await gate.buildAsync({ id: 1 });
    assert.instanceOf(representative, Representative);
    assert.isFalse(representative.guardDecision);
  });

  it("Combines dependencies from guards", async () => {
    const gate = new Gate<MockPolicies>();

    gate.guard((_, provide) => {
      provide("syncKey", "syncValue");
      return undefined;
    });
    gate.asyncGuard(async (_, provide) => {
      provide("asyncKey", "asyncValue");
      return true;
    });

    const representative = await gate.buildAsync({ id: 1 });
    assert.deepEqual(representative["_dependencies"], {
      syncKey: "syncValue",
      asyncKey: "asyncValue"
    });
  });

  it("Handles missing policies gracefully", () => {
    const gate = new Gate<MockPolicies>();

    const representative = gate.build({ id: 1 });
    assert.isUndefined(representative.guardDecision); // No policy or guard to influence decision
  });

  it("Handles no guards or policies", async () => {
    const gate = new Gate<MockPolicies>();

    const syncRepresentative = gate.build({ id: 1 });
    const asyncRepresentative = await gate.buildAsync({ id: 1 });

    assert.isUndefined(syncRepresentative.guardDecision);
    assert.isUndefined(asyncRepresentative.guardDecision);
  });
});
