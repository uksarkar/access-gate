import { assert, describe, it } from "vitest";
import { isUndefined } from "../../../src/helpers/util";

describe("Identify undefined value", () => {
  it("Check primitive undefined values", () => {
    let val;
    assert.isTrue(isUndefined(undefined), "Should check primitive undefined");
    assert.isTrue(isUndefined(val), "Should check undefined variable");

    val = undefined;
    assert.isTrue(
      isUndefined(val),
      "Should identify a variable with undefined value"
    );
  });

  it("Should identify non undefined values", () => {
    assert.isFalse(isUndefined(false));
    assert.isFalse(isUndefined(0));
    assert.isFalse(isUndefined(true));
    assert.isFalse(isUndefined({}));
    assert.isFalse(isUndefined([]));
  });
});
