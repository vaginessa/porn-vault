import "mocha";

import { expect } from "chai";
import path from "path";

import { onSceneCreate } from "../../../src/plugins/events/scene";
import Scene from "../../../src/types/scene";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";

describe("plugins", () => {
  after(async () => {
    await cleanupPluginsConfig();
  });

  describe("events", () => {
    describe("scene", () => {
      CONFIG_FIXTURES.forEach((configFixture) => {
        before(async () => {
          await initPluginsConfig(configFixture);
        });
        ["sceneCreated", "sceneCustom"].forEach((event: string) => {
          const pluginNames = configFixture.config.plugins.events[event];
          expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

          const scenePluginFixture = require(path.resolve(
            configFixture.config.plugins.register[pluginNames[0]].path
          ));

          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async () => {
            const initialName = "initial scene name";
            let scene = new Scene(initialName);

            expect(scene.name).to.equal(initialName);

            expect(scene.name).to.not.equal(scenePluginFixture.result.name);
            expect(scene.path).to.not.equal(scenePluginFixture.result.path);
            expect(scene.description).to.not.equal(scenePluginFixture.result.description);
            expect(scene.releaseDate).to.not.equal(scenePluginFixture.result.releaseDate);
            expect(scene.addedOn).to.not.equal(scenePluginFixture.result.addedOn);
            expect(scene.rating).to.not.equal(scenePluginFixture.result.rating);
            expect(scene.favorite).to.not.equal(scenePluginFixture.result.favorite);
            expect(scene.bookmark).to.not.equal(scenePluginFixture.result.bookmark);

            scene = await onSceneCreate(scene, [], [], event);

            expect(scene.name).to.equal(scenePluginFixture.result.name);
            expect(scene.path).to.equal(scenePluginFixture.result.path);
            expect(scene.description).to.equal(scenePluginFixture.result.description);
            expect(scene.releaseDate).to.equal(scenePluginFixture.result.releaseDate);
            expect(scene.addedOn).to.equal(scenePluginFixture.result.addedOn);
            expect(scene.rating).to.equal(scenePluginFixture.result.rating);
            expect(scene.favorite).to.equal(scenePluginFixture.result.favorite);
            expect(scene.bookmark).to.equal(scenePluginFixture.result.bookmark);
          });
        });
      });
    });
  });
});
