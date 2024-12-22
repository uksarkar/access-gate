import { assert, describe, it } from "vitest";
import { Policy } from "../../../src/core/policy";

describe("Policy class", () => {
  it("Define policy", () => {
    const policy = new Policy("user");

    assert.equal(policy.name, "user");

    policy.define("update", () => true);

    assert.isTrue(policy.actions.update?.());
    assert.isTrue("update" in policy.actions);

    policy.define("view", (a, b) => a === b);

    assert.isTrue(policy.actions.view?.(200, 200));
    assert.isFalse(policy.actions.view?.("200", 200 as any));
  });

  it("Overwrites action definitions", () => {
    const policy = new Policy("user");

    policy.define("view", () => true);
    assert.isTrue(policy.actions.view?.());

    policy.define("view", () => false); // Overwrite
    assert.isFalse(policy.actions.view?.());
  });

  it("Guards are evaluated in order", () => {
    const policy = new Policy("user");

    const results: string[] = [];

    policy.guard(() => {
      results.push("guard 1");
      return undefined;
    });
    policy.guard(() => {
      results.push("guard 2");
      return false;
    });
    policy.guard(() => {
      results.push("guard 3");
      return true;
    });

    assert.deepEqual(policy.getGuardDecision({}), [false, {}]);
    assert.deepEqual(results, ["guard 1", "guard 2"]); // Guard 3 should not run
  });

  it("Policy guards", async () => {
    const policy = new Policy("post");

    policy.define("update", () => true);
    assert.isTrue(policy.actions.update?.());

    policy.guard(() => false);
    assert.deepEqual(policy.getGuardDecision({}), [false, {}]);

    policy.asyncGuard(() => Promise.resolve(true));
    assert.deepEqual(await policy.getAsyncGuardDecision({}), [true, {}]);
  });

  it("Multiple policy guards", async () => {
    const policy = new Policy("user");

    policy.guard(() => undefined);
    policy.guard(() => false);
    policy.guard(() => true);

    assert.deepEqual(policy.getGuardDecision({}), [false, {}]);

    policy.asyncGuard(() => Promise.resolve(undefined));
    policy.asyncGuard(() => Promise.resolve(true));
    policy.asyncGuard(() => Promise.resolve(false));

    assert.deepEqual(await policy.getAsyncGuardDecision({}), [true, {}]);
  });

  it("Policy guard provides dependency", async () => {
    const policy = new Policy("user");

    policy.guard(
      (representative: number, provide: (k: string, v: number) => void) => {
        provide("first_representative", representative);
        return undefined;
      }
    );
    policy.guard(() => false);
    policy.guard(() => true);

    assert.deepEqual(policy.getGuardDecision(1000), [
      false,
      { first_representative: 1000 }
    ]);

    policy.asyncGuard(() => Promise.resolve(undefined));
    policy.asyncGuard(
      (r: { id: number }, provide: (k: string, v: any) => void) => {
        provide("async_representative_id", r.id);
        return Promise.resolve(true);
      }
    );
    policy.asyncGuard(() => Promise.resolve(false));

    assert.deepEqual(await policy.getAsyncGuardDecision({ id: 4000 }), [
      true,
      { async_representative_id: 4000 }
    ]);
  });

  it("Policy lazy guards", async () => {
    const policy = new Policy("user");

    policy.lazyGuard(() => undefined);
    policy.lazyGuard(() => true);
    policy.lazyGuard(() => false);

    assert.equal(policy.lazyGuards.length, 3);

    policy.asyncLazyGuard(() => Promise.resolve(false));
    assert.equal(policy.asyncLazyGuards.length, 1);
  });

  it("Evaluates lazy guards correctly", async () => {
    const policy = new Policy("user");

    policy.lazyGuard(rep => rep === 1);
    policy.asyncLazyGuard(async rep => rep === 2);

    const lazyGuards = policy.lazyGuards;
    const asyncLazyGuards = policy.asyncLazyGuards;

    assert.isTrue(lazyGuards[0]?.(1, {}, () => {}));
    assert.isFalse(lazyGuards[0]?.(2, {}, () => {}));
    assert.isTrue(await asyncLazyGuards[0]?.(2, {}, () => {}));
    assert.isFalse(await asyncLazyGuards[0]?.(1, {}, () => {}));
  });

  it("Persists dependencies across guards", () => {
    const policy = new Policy("user");

    policy.guard((_, provide) => {
      provide("key1", "value1");
      return undefined;
    });
    policy.guard((_, provide) => {
      provide("key2", "value2");
      return false;
    });

    assert.deepEqual(policy.getGuardDecision({}), [
      false,
      { key1: "value1", key2: "value2" }
    ]);
  });
});
