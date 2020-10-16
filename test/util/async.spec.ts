import { expect } from "chai";
import { mapAsync, filterAsync } from "../../src/utils/async";

describe("mapAsync", () => {
  it("Should map array ", async () => {
    expect(await mapAsync([1, 2, 3, 4, 5], async (num) => num * 2)).to.deep.equal([2, 4, 6, 8, 10]);
  });

  it("Should filter array", async () => {
    expect(await filterAsync([1, 15, 6, 10, -1], async (num) => num >= 10)).to.deep.equal([15, 10]);
  });
});
