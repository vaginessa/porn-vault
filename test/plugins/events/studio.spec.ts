import "mocha";
import { expect } from "chai";
import { onStudioCreate } from "../../../src/plugins/events/studio";
import Studio from "../../../src/types/studio";
import { cleanupPluginsConfig, initPluginsConfig } from "../initPluginFixtures";

const studioPluginFixture = require("../fixtures/studio_plugin.fixture");

describe("plugins", () => {
  before(async () => {
    await initPluginsConfig();
  });

  after(async () => {
    await cleanupPluginsConfig();
  });

  describe("events", () => {
    describe("studio", () => {
      ["studioCreated", "studioCustom"].forEach((event: string) => {
        it(`event '${event}': runs fixture plugin, changes properties`, async () => {
          const initialName = "initial studio name";
          let studio = new Studio(initialName);
          expect(studio.name).to.equal(initialName);
          expect(studio.name).to.not.equal(studioPluginFixture.result.name);
          expect(studio.description).to.not.equal(studioPluginFixture.result.description);
          expect(studio.favorite).to.not.equal(studioPluginFixture.result.favorite);
          expect(studio.bookmark).to.not.equal(studioPluginFixture.result.bookmark);
          expect(studio.aliases).to.not.deep.equal(studioPluginFixture.result.aliases);

          studio = await onStudioCreate(studio, [], event);

          expect(studio.name).to.not.equal(initialName);
          expect(studio.name).to.equal(studioPluginFixture.result.name);
          expect(studio.name).to.equal(studioPluginFixture.result.name);
          expect(studio.description).to.equal(studioPluginFixture.result.description);
          expect(studio.favorite).to.equal(studioPluginFixture.result.favorite);
          expect(studio.bookmark).to.equal(studioPluginFixture.result.bookmark);
          expect(studio.aliases).to.deep.equal(studioPluginFixture.result.aliases);
        });
      });
    });
  });
});
