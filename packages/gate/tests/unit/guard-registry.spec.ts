import { assert, describe, it } from "vitest";
import { GuardContainer } from "../../src/core/guard-registry";

// Temporary subclass to expose protected methods
class TestGuardContainer extends GuardContainer {
  public evaluateGuardsPublic(representative: unknown) {
    return this.evaluateGuards(representative);
  }

  public async evaluateAsyncGuardsPublic(representative: unknown) {
    return this.evaluateAsyncGuards(representative);
  }
}

describe("GuardContainer class", () => {
  it("Registers and evaluates guards", () => {
    const container = new TestGuardContainer();

    // Add guards
    container.guard(() => undefined); // No decision
    container.guard(() => false); // Decision is false
    container.guard(() => true); // Decision is true

    // Evaluate guards
    const [decision, dependencies] = container.evaluateGuardsPublic({});
    assert.isFalse(decision); // Should stop at the first definitive guard
    assert.deepEqual(dependencies, {}); // No dependencies provided
  });

  it("Registers and evaluates async guards", async () => {
    const container = new TestGuardContainer();

    // Add async guards
    container.asyncGuard(async () => undefined); // No decision
    container.asyncGuard(async () => false); // Decision is false
    container.asyncGuard(async () => true); // Decision is true

    // Evaluate async guards
    const [decision, dependencies] = await container.evaluateAsyncGuardsPublic(
      {}
    );
    assert.isFalse(decision); // Should stop at the first definitive guard
    assert.deepEqual(dependencies, {}); // No dependencies provided
  });

  it("Provides dependencies in guards", () => {
    const container = new TestGuardContainer();

    container.guard((_: any, provide: (k: string, v: any) => void) => {
      provide("key1", "value1");
      return undefined;
    });
    container.guard((_: any, provide: (k: string, v: any) => void) => {
      provide("key2", "value2");
      return false;
    });

    const [decision, dependencies] = container.evaluateGuardsPublic({});
    assert.isFalse(decision);
    assert.deepEqual(dependencies, { key1: "value1", key2: "value2" });
  });

  it("Provides dependencies in async guards", async () => {
    const container = new TestGuardContainer();

    container.asyncGuard(
      async (_: any, provide: (k: string, v: any) => void) => {
        provide("asyncKey1", "asyncValue1");
        return undefined;
      }
    );
    container.asyncGuard(
      async (_: any, provide: (k: string, v: any) => void) => {
        provide("asyncKey2", "asyncValue2");
        return true;
      }
    );

    const [decision, dependencies] = await container.evaluateAsyncGuardsPublic(
      {}
    );
    assert.isTrue(decision);
    assert.deepEqual(dependencies, {
      asyncKey1: "asyncValue1",
      asyncKey2: "asyncValue2"
    });
  });

  it("Handles empty guards and async guards", async () => {
    const container = new TestGuardContainer();

    // No guards added
    let [decision, dependencies] = container.evaluateGuardsPublic({});
    assert.isUndefined(decision);
    assert.deepEqual(dependencies, {});

    [decision, dependencies] = await container.evaluateAsyncGuardsPublic({});
    assert.isUndefined(decision);
    assert.deepEqual(dependencies, {});
  });
});
