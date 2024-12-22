import { assert, describe, it } from "vitest";
import Decision from "../../../src/core/decision";
import { AsyncLazyGuard, LazyGuard } from "src";

describe("Decision class", () => {
  it("Handles default conclusion when no guards or restrictions are present", () => {
    const decision = new Decision([], [], {}, undefined, true, false, false);

    assert.isTrue(decision.allowDefault().conclusion);
    assert.isFalse(decision.denyDefault().conclusion);
  });

  it("Check getters", () => {
    const decision = new Decision(
      [],
      [],
      [],
      undefined,
      false,
      false,
      false,
      undefined,
      false,
      {}
    );

    assert.isFalse(decision.conclusion);
    assert.isFalse(decision.hasAction);
    assert.isFalse(decision.hasPolicy);
    assert.isFalse(decision.passedDefault);
    assert.isFalse(decision.isGuardDecision);
  });

  it("Evaluates lazy guards correctly", () => {
    const lazyGuards = [() => undefined, () => true, () => false];
    const decision = new Decision(
      lazyGuards,
      [],
      {},
      undefined,
      false,
      true,
      false
    );

    assert.isTrue(decision.can());
    assert.equal(decision.conclusion, true);
  });

  it("Stops evaluation at the first definitive lazy guard", () => {
    const lazyGuards = [
      () => undefined,
      () => false, // This should stop further evaluation
      () => true
    ];
    const decision = new Decision(
      lazyGuards,
      [],
      {},
      undefined,
      false,
      true,
      false
    );

    assert.isFalse(decision.can());
  });

  it("Evaluates async lazy guards correctly", async () => {
    const asyncLazyGuards = [async () => undefined, async () => true];
    const decision = new Decision(
      [],
      asyncLazyGuards,
      {},
      undefined,
      false,
      true,
      false
    );

    assert.isTrue(await decision.could());
    assert.equal(decision.conclusion, true);
  });

  it("Stops async lazy guard evaluation at the first definitive result", async () => {
    const asyncLazyGuards = [
      async () => undefined,
      async () => false, // This should stop further evaluation
      async () => true
    ];
    const decision = new Decision(
      [],
      asyncLazyGuards,
      {},
      undefined,
      false,
      true,
      false
    );

    assert.isFalse(await decision.could());
  });

  it("Uses restrictions when no lazy guards are definitive", () => {
    const restriction = (rep: number, entity: number) => rep === entity;
    const decision = new Decision(
      [],
      [],
      1000,
      undefined,
      false,
      true,
      false,
      restriction as any
    );

    assert.isTrue(decision.can(1000));
    assert.isFalse(decision.can(2000));
  });

  it("Evaluates async lazy guards before applying restrictions", async () => {
    const asyncLazyGuards = [async () => undefined, async () => false];
    const restriction = (rep: number, entity: number) => rep === entity;

    const decision = new Decision(
      [],
      asyncLazyGuards,
      1000,
      undefined,
      false,
      true,
      false,
      restriction as any
    );

    assert.isFalse(await decision.could(2000)); // Async guard overrides restriction
  });

  it("Allows and denies defaults appropriately", () => {
    const decision = new Decision([], [], {}, false, false, false, false);

    decision.allowDefault();
    assert.isTrue(decision.passedDefault);

    decision.denyDefault();
    assert.isFalse(decision.passedDefault);
  });

  it("Provides dependencies during evaluation", () => {
    const lazyGuards: LazyGuard[] = [
      (_: any, __, provide: (k: string, v: unknown) => void) => {
        provide("key1", "value1");
        return undefined;
      },
      (_: any, __, provide: (k: string, v: unknown) => void) => {
        provide("key2", "value2");
        return false;
      }
    ];

    const decision = new Decision(
      lazyGuards,
      [],
      {},
      false,
      false,
      true,
      false
    );
    decision.can();

    assert.deepEqual(decision["_dependencies"], {
      key1: "value1",
      key2: "value2"
    });
  });

  it("Provides dependencies during async evaluation", async () => {
    const asyncLazyGuards: AsyncLazyGuard[] = [
      async (_, __, provide) => {
        provide("asyncKey1", "asyncValue1");
        return undefined;
      },
      async (_, __, provide) => {
        provide("asyncKey2", "asyncValue2");
        return true;
      }
    ];

    const decision = new Decision(
      [],
      asyncLazyGuards,
      {},
      false,
      false,
      true,
      false
    );
    await decision.could();

    assert.deepEqual(decision["_dependencies"], {
      asyncKey1: "asyncValue1",
      asyncKey2: "asyncValue2"
    });
  });
});
