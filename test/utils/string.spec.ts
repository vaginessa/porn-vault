import { expect } from "chai";

import { removeExtension } from "../../src/utils/string";
import removeExtensionFixtures from "./fixtures/remove_extension.fixture";

describe("utils", () => {
  describe("String utils", () => {
    describe("removeExtension", () => {
      for (const test of removeExtensionFixtures) {
        it("Should work as expected", () => {
          expect(removeExtension(test[0])).equals(test[1]);
        });
      }
    });
  });
});
