import { expect } from "chai";

import { arrayDiff, filterInvalidAliases, generateTimestampsAtIntervals, isArrayEq } from "../../src/utils/misc";
import * as arrayDiffFixtures from "./fixtures/array_diff.fixtures";
import * as generateTimestampsFixtures from "./fixtures/generate_timestamps.fixtures";
import * as isArrayEqFixtures from "./fixtures/is_array_eq.fixtures";
import * as filterInvalidAliasesFixtures from "./fixtures/filter_invalid_aliases.fixtures";

describe("utils/misc", () => {
  describe("generateTimestampsAtIntervals", () => {
    for (const fixture of generateTimestampsFixtures.generateTimestampsAtIntervals) {
      it("generates correct timestamps", () => {
        const timestamps = generateTimestampsAtIntervals(
          fixture.count,
          fixture.duration,
          fixture.options
        );
        expect(timestamps).to.deep.equal(fixture.expected);
      });
    }
  });

  describe("arrayDiff", () => {
    for (const fixture of arrayDiffFixtures.fixtures) {
      it(`diff: ${fixture.name}`, () => {
        const res = arrayDiff(fixture.source, fixture.target, "_id", "_id");
        expect(res).to.deep.equal(fixture.expected);
      });
    }
  });

  describe("isArrayEq", () => {
    for (const fixture of isArrayEqFixtures.fixtures) {
      it(`${fixture.name}: expected eq: ${fixture.expected}`, () => {
        const res = isArrayEq(fixture.source, fixture.target, "_id", "_id");
        expect(res).to.equal(fixture.expected);
      });
    }
  });

  describe("filterInvalidAliases", () => {
    for (const fixture of filterInvalidAliasesFixtures.fixtures) {
      it(`filter: ${fixture.aliases}`, () => {
        const res = filterInvalidAliases(fixture.aliases);
        expect(res).to.deep.equal(fixture.expected)
      });
    }
  });
});
