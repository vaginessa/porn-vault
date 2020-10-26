import { expect } from "chai";

import { FullWordExtractor } from "../../src/matching/fullWordMatcher";
import { mappings } from "./full.fixtures";

describe.only("extractor", () => {
  describe("full", () => {
    mappings.forEach((mapping) => {
      mapping.studios.forEach((studio) => {
        mapping.does_match.forEach((expectedMatch) => {
          it(`'${studio}' matches '${expectedMatch}'`, () => {
            expect(
              new FullWordExtractor({
                flattenWordGroups: mapping.options?.flattenWordGroups,
              }).filterMatchingInputs([studio], expectedMatch)
            ).to.deep.equal([studio]);
          });
        });
        mapping.non_match.forEach((noMatch) => {
          it(`'${studio}' does not match '${noMatch}'`, () => {
            expect(
              new FullWordExtractor({
                flattenWordGroups: mapping.options?.flattenWordGroups,
              }).filterMatchingInputs([studio], noMatch)
            ).to.deep.equal([]);
          });
        });
      });
    });
  });
});
