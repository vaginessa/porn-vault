import { extensionFromUrl } from "../../src/utils/string";
import tests from "./fixtures/url_ext.fixture";
import { expect } from "chai";

describe("utils", () => {
  describe("Parse URL file extension", () => {
    for (const test of tests) {
      it(`Should get ${test[1]} from ${test[0]}`, async () => {
        expect(extensionFromUrl(test[0])).to.equal(test[1]);
      });
    }
  });
});
