import { expect } from "chai";

import { removeUnknownProperties } from "../../src/utils/misc";
import fixtures from "./fixtures/removeUnknownProperties.fixtures";

describe("removeUnknownProperties", () => {
  fixtures.forEach((fixture, fixtureIndex) => {
    it(`${fixtureIndex} should remove unknown properties`, () => {
      if (fixture.noChange) {
        expect(fixture.target).to.deep.equal(fixture.expected);
      }

      removeUnknownProperties(fixture.target, fixture.default, fixture.ignorePaths);

      expect(fixture.target).to.deep.equal(fixture.expected);
    });
  });
});
