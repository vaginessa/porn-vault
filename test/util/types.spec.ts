import { expect } from "chai";
import { isBoolean, isNumber } from "../../src/utils/types";

describe("Type utils", () => {
  it("isNumber", async () => {
    expect(isNumber(5)).to.be.true;
    expect(isNumber(true)).to.be.false;
    expect(isNumber("str")).to.be.false;
  });

  it("isBoolean", async () => {
    expect(isBoolean(false)).to.be.true;
    expect(isBoolean("str")).to.be.false;
    expect(isBoolean(4)).to.be.false;
  });
});
