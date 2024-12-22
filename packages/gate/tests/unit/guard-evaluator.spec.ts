import { assert, describe, expect, it } from "vitest";
import {
  evaluateAsyncGuards,
  evaluateGuards
} from "../../src/helpers/guard-evaluator";
import { isUndefined } from "src/helpers/util";

const globalGuards = {
  "Guard should return true": {
    guards: [
      () => undefined,
      () => true, // guard should break here
      () => false
    ],
    expect: true
  },
  "Guard should return false": {
    guards: [
      () => undefined,
      () => false, // guard should break here
      () => true
    ],
    expect: false
  },
  "Guard should evaluate the representative and return true": {
    guards: [() => undefined, (re: { id: number }) => re.id === 3, () => false],
    representative: { id: 3 },
    expect: true
  },
  "Guard should provide correct value to the dependency": {
    guards: [
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked", 200);
      },
      () => false,
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked", 300);
      }
    ],
    expect: false,
    expectDependencies: { checked: 200 }
  },
  "Guard should override dependency": {
    guards: [
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked", 200);
      },
      () => undefined,
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked", 300);
      }
    ],
    expect: undefined,
    expectDependencies: { checked: 300 }
  },
  "Guard should add new dependency": {
    guards: [
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked", 200);
      },
      () => undefined,
      (r: unknown, provide: (k: string, v: number) => void) => {
        provide("checked2", 300);
      }
    ],
    expect: undefined,
    expectDependencies: { checked: 200, checked2: 300 }
  },
  "Lazy global guard should return true": {
    guards: [
      () => undefined,
      (r: { id: number }, e: { authorId: number }) => r.id === e.authorId
    ],
    expect: true,
    representative: { id: 1000 },
    entity: { authorId: 1000 }
  },
  "Lazy global guard should return false": {
    guards: [() => false, () => true],
    entity: {},
    expect: false
  },
  "Lazy global guard should add dependency": {
    guards: [
      () => undefined,
      (
        r: { id: number },
        e: { id: number },
        provide: (key: string, v: any) => void
      ) => {
        provide("addition", r.id + e.id);
        provide("r.id", r.id);
        provide("e.id", e.id);
      }
    ],
    expect: undefined,
    representative: { id: 300 },
    entity: { id: 500 },
    expectDependencies: { addition: 800, "r.id": 300, "e.id": 500 }
  }
};

describe("Evaluate global guards", () => {
  Object.entries(globalGuards).forEach(([key, obj]) => {
    const {
      dependencies,
      expect,
      expectDependencies = {},
      guards,
      representative,
      entity
    } = obj as unknown as Record<string, any>;
    it(key, () => {
      const resultingDep = dependencies || {};
      const evaluated = !isUndefined(entity)
        ? evaluateGuards(
            guards,
            representative,
            entity,
            (name: string, v: unknown) => {
              resultingDep[name] = v;
            }
          )
        : evaluateGuards(guards, representative, (name: string, v: unknown) => {
            resultingDep[name] = v;
          });

      assert.equal(expect, evaluated);
      assert.deepEqual(resultingDep, expectDependencies);
    });
  });
});
