import { expect } from "chai";

import { arrayDiff, generateTimestampsAtIntervals } from "../../src/utils/misc";
import * as generateTimestampsFixtures from "./fixtures/generate_timestamps.fixtures";
import * as arrayDiffFixtures from "./fixtures/array_diff.fixtures";

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
});
