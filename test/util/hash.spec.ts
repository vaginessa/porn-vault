import { expect } from "chai";
import { randomString } from "../../src/utils/hash";

describe("Hash gen", () => {
  it("randomString", () => {
    expect(randomString()).to.be.a("string").with.length(8);
    expect(randomString(35)).to.be.a("string").with.length(35);
  });
});
