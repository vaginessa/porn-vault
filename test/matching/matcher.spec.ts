import { expect } from "chai";

import { ignoreSingleNames, isSingleWord } from "../../src/matching/matcher";

describe("matcher", () => {
  describe("isSingleWord", () => {
    for (const word of ["test", "", "1234", "numbermix1234"])
      it("Should be a seen as a single word", () => {
        expect(isSingleWord(word)).to.be.true;
      });

    for (const word of [
      "avi love",
      "some fairly long sentence",
      "even works with 124124 numbers",
    ]) {
      it("Should not be a seen as a single word", () => {
        expect(isSingleWord(word)).to.be.false;
      });
    }
  });

  describe("ignoreSingleNames", () => {
    it("Should ignore single names", () => {
      expect(ignoreSingleNames(["", "name", "avi love", "kali roses"])).deep.equals([
        "avi love",
        "kali roses",
      ]);
    });

    it("Should not ignore regex", () => {
      expect(ignoreSingleNames(["regex:(avi love)|(avi looove)", "regex:[a-z]+"])).deep.equals([
        "regex:(avi love)|(avi looove)",
        "regex:[a-z]+",
      ]);
    });
  });
});
