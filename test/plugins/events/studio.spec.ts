import "mocha";

import { expect } from "chai";
import path from "path";

import { onStudioCreate } from "../../../src/plugins/events/studio";
import Studio from "../../../src/types/studio";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";

describe("plugins", () => {
  describe("events", () => {
    describe("studio", () => {
      CONFIG_FIXTURES.forEach((configFixture) => {
        before(async () => {
          await initPluginsConfig(configFixture.path, configFixture.config);
        });

        after(async () => {
          await cleanupPluginsConfig();
        });

        ["studioCreated", "studioCustom"].forEach((event: string) => {
          const pluginNames = configFixture.config.plugins.events[event];
          expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

          const scenePluginFixture = require(path.resolve(
            configFixture.config.plugins.register[pluginNames[0]].path
          ));

          it(`event '${event}': runs fixture plugin, changes properties`, async () => {
            const initialName = "initial studio name";
            let studio = new Studio(initialName);

            expect(studio.name).to.equal(initialName);

            expect(studio.name).to.not.equal(scenePluginFixture.result.name);
            expect(studio.description).to.not.equal(scenePluginFixture.result.description);
            expect(studio.favorite).to.not.equal(scenePluginFixture.result.favorite);
            expect(studio.bookmark).to.not.equal(scenePluginFixture.result.bookmark);
            expect(studio.aliases).to.not.deep.equal(scenePluginFixture.result.aliases);

            studio = await onStudioCreate(studio, [], event);

            expect(studio.name).to.equal(scenePluginFixture.result.name);
            expect(studio.description).to.equal(scenePluginFixture.result.description);
            expect(studio.favorite).to.equal(scenePluginFixture.result.favorite);
            expect(studio.bookmark).to.equal(scenePluginFixture.result.bookmark);
            expect(studio.aliases).to.deep.equal(scenePluginFixture.result.aliases);
          });
        });
      });
    });
  });
});
