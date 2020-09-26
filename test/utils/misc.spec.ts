import { expect } from 'chai';

import { generateTimestampsAtIntervals } from '../../src/utils/misc';
import * as fixtures from './misc.fixtures';

describe("utils/misc", () => {
  describe("generateTimestampsAtIntervals", () => {
    for (const fixture of fixtures.generateTimestampsAtIntervals) {
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
});
