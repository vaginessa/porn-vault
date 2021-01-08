import "mocha";

import { assert } from "chai";

import defaultConfig from "../../src/config/default";
import { isValidConfig } from "../../src/config/schema";
import { invalidConfig } from "./schema.fixture";

describe("schema", () => {
  describe("isValidConfig", () => {
    it("default config is valid", () => {
      const validationResult = isValidConfig(defaultConfig);
      assert.notInstanceOf(validationResult, Error);
      assert.isTrue(validationResult);
    });


    // Since we are simply using zod's validation, without custom value validation,
    // we only need once test to verify the 'isValidConfig' function,
    // since we do not want to duplicate the tests of the 'zod' package
    it("dummy invalid config fails validation", () => {
      const validationResult = isValidConfig(invalidConfig);
      assert.isNotTrue(validationResult);
      assert.isObject(validationResult);
      assert.instanceOf((validationResult as any).error, Error);
    });
  });
});
