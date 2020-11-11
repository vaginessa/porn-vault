import { WordMatcher } from "./../../src/matching/wordMatcher";
import { expect } from "chai";

import { wordMatchFixtures } from "./fixtures/wordMatcher.fixtures";

describe("matcher", () => {
  describe("Word matcher", () => {
    wordMatchFixtures.forEach((fixture, fixtureIndex) => {
      fixture.compares.forEach((compareFixture, compareFixtureIndex) => {
        compareFixture.compareStrings.forEach((compareString, compareStringIndex) => {
          it(`${fixtureIndex}${compareFixtureIndex}${compareStringIndex} '${fixture.name}': gets expected match against '${compareString}'`, () => {
            const matchItems = new WordMatcher({
              ...(fixture.options as any),
            }).filterMatchingItems(
              fixture.inputs.map((input) => ({ _id: input, input })),
              compareString,
              (testItem) => [testItem.input]
            );

            const matchStrs = matchItems.map(i => i.input)

            expect(matchStrs).to.deep.equal(compareFixture.expected);
          });
        });
      });
    });
  });
});
