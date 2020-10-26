import { expect } from "chai";

import { FullWordExtractor } from "../../src/matching/fullWordMatcher";
import { fullWordMatchFixtures } from "./full.fixtures";

describe.only("extractor", () => {
  describe("full", () => {
    fullWordMatchFixtures.forEach((fixture) => {
      fixture.compare_does_match.compareStrings.forEach((compareString) => {
        it(`inputs do match '${compareString}'`, () => {
          const matches = new FullWordExtractor({
            flattenWordGroups: fixture.options?.flattenWordGroups,
          }).filterMatchingInputs(fixture.inputs, compareString);
          expect(matches).to.deep.equal(fixture.compare_does_match.expected);
        });
      });

      fixture.compare_non_match.compareStrings.forEach((compareString) => {
        it(`inputs do not match '${compareString}'`, () => {
          const matches = new FullWordExtractor({
            flattenWordGroups: fixture.options?.flattenWordGroups,
          }).filterMatchingInputs(fixture.inputs, compareString);
          expect(matches).to.deep.equal(fixture.compare_non_match.expected);
        });
      });
    });
  });
});
