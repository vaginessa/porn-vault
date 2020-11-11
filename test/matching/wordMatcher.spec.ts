import { expect } from "chai";

import { FullWordExtractor } from "../../src/matching/wordMatcher";
import { fullWordMatchFixtures } from "./wordMatcher.fixtures";

describe.only("matcher", () => {
  describe("wordMatcher", () => {
    fullWordMatchFixtures.forEach((fixture, fixtureIndex) => {
      fixture.compares.forEach((compareFixture, compareFixtureIndex) => {
        compareFixture.compareStrings.forEach((compareString, compareStringIndex) => {
          it(`${fixtureIndex}${compareFixtureIndex}${compareStringIndex} '${fixture.name}': gets expected match against '${compareString}'`, () => {
            const matches = new FullWordExtractor({
              ...(fixture.options as any),
            }).filterMatchingInputs(
              fixture.inputs.map((input) => ({ id: input, inputs: [input] })),
              compareString
            );

            expect(matches).to.deep.equal(compareFixture.expected);
          });
        });
      });
    });
  });
});
