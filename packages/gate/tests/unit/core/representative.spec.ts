import { assert, describe, it } from "vitest";
import { Representative } from "../../../src/core/representative";
import { Policy } from "../../../src/core/policy";
import { Gate } from "../../../src/core/gate";
import { PolicyActionMapTuple } from "src/types/action";

describe("Representative class", () => {
  // Mock Gate
  const createMockGate = () => {
    const gate = {
      policies: {
        user: new Policy("user"),
        post: new Policy("post")
      },
      lazyGuards: [],
      asyncLazyGuards: []
    } as unknown as Gate<{ user: { view: PolicyActionMapTuple }; post: {} }>;

    return gate;
  };

  it("Evaluates access with global guard decision", () => {
    const gate = createMockGate();
    const representative = new Representative(gate, { id: 1 }, true, {});

    const decision = representative.access("user", "view");
    assert.isTrue(decision.conclusion);
    assert.isTrue(decision.isGuardDecision);
  });

  it("Handles missing policy gracefully", () => {
    const gate = createMockGate();
    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = representative.access("nonexistent", "view");
    assert.isFalse(decision.conclusion);
    assert.isFalse(decision.hasPolicy);
  });

  it("Combines global and policy guards for sync evaluation", () => {
    const gate = createMockGate();
    gate.policies.user?.guard(() => false); // Policy guard
    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = representative.access("user", "update");
    assert.isFalse(decision.conclusion);
    assert.isTrue(decision.isGuardDecision);
  });

  it("Evaluates async access with policy-specific async guards", async () => {
    const gate = createMockGate();
    gate.policies.post?.asyncGuard(async () => true); // Async guard
    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = await representative.asyncAccess("post", "create");
    assert.isTrue(decision.conclusion);
  });

  it("Handles dependencies provided by guards", async () => {
    const gate = createMockGate();
    gate.policies.user?.guard((_, provide) => {
      provide("key", "value");
      return undefined;
    });
    gate.policies.user?.asyncGuard(async (_, provide) => {
      provide("asyncKey", "asyncValue");
      return undefined;
    });

    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const syncDecision = representative.access("user", "view");
    assert.isFalse(syncDecision.conclusion);
    assert.deepEqual(syncDecision["_dependencies"], { key: "value" });

    const asyncDecision = await representative.asyncAccess("user", "view");
    assert.isFalse(asyncDecision.conclusion);
    assert.deepEqual(asyncDecision["_dependencies"], {
      key: "value",
      asyncKey: "asyncValue"
    });
  });

  it("Evaluates lazy guards for access", () => {
    const gate = createMockGate();
    gate.lazyGuards.push(() => false); // Global lazy guard
    gate.policies.post?.lazyGuard(() => true); // Policy-specific lazy guard

    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = representative.access("post", "edit");
    assert.isFalse(decision.conclusion); // Global guard takes precedence
  });

  it("Combines lazy and async lazy guards for access", async () => {
    const gate = createMockGate();
    gate.lazyGuards.push(() => undefined);
    gate.asyncLazyGuards.push(async () => true);
    gate.policies.user?.lazyGuard(() => false);
    gate.policies.user?.asyncLazyGuard(async () => false);

    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const syncDecision = representative.access("user", "delete");
    assert.isFalse(syncDecision.conclusion);

    const asyncDecision = await representative.asyncAccess("user", "delete");
    assert.isFalse(asyncDecision.conclusion);
  });

  it("Returns correct Decision for undefined guard decisions", () => {
    const gate = createMockGate();
    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = representative.access("user", "update");
    assert.isFalse(decision.conclusion); // Default to false for undefined guards
  });

  it("Combines global and policy-specific dependencies", async () => {
    const gate = createMockGate();
    gate.lazyGuards.push((_, __, provide: any) => {
      provide("globalKey", "globalValue");
      return undefined;
    });
    gate.policies.user?.lazyGuard((_, __, provide: any) => {
      provide("policyKey", "policyValue");
      return true;
    });

    const representative = new Representative(gate, { id: 1 }, undefined, {});

    const decision = await representative.asyncAccess("user", "view");
    assert.isTrue(decision.can());
    assert.deepEqual(decision["_dependencies"], {
      globalKey: "globalValue",
      policyKey: "policyValue"
    });
  });
});
