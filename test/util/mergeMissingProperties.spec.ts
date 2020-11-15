import { expect } from "chai";

import { mergeMissingProperties } from "../../src/utils/misc";
import fixtures from "./fixtures/mergeMissingProperties.fixtures";

describe("mergeMissingProperties", () => {
  fixtures.forEach((fixture, fixtureIndex) => {
    it(`${fixtureIndex} should only add missing properties`, () => {
      if (fixture.noChange) {
        expect(fixture.target).to.deep.equal(fixture.expected);
      }

      mergeMissingProperties(fixture.target, fixture.defaults, fixture.ignorePaths || []);

      expect(fixture.target).to.deep.equal(fixture.expected);
    });
  });
});
