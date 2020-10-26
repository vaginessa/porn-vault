import { expect } from "chai";

import { FullWordExtractor } from "../../src/matching/fullWordMatcher";
import { fullWordMatchFixtures } from "./full.fixtures";

describe.only("extractor", () => {
  describe("full", () => {
    fullWordMatchFixtures.forEach((fixture, fixtureIndex) => {
      fixture.compares.forEach((compareFixture, compareFixtureIndex) => {
        compareFixture.compareStrings.forEach((compareString, compareStringIndex) => {
          it(`${fixtureIndex}${compareFixtureIndex}${compareStringIndex} '${fixture.name}': gets expected match against '${compareString}'`, () => {
            const matches = new FullWordExtractor({ ...fixture.options as any }).filterMatchingInputs(
              fixture.inputs,
              compareString
            );

            expect(matches).to.deep.equal(compareFixture.expected);
          });
        });
      });
    });
  });
});
