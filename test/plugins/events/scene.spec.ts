import "mocha";

import { expect } from "chai";
import path from "path";

import { onSceneCreate } from "../../../src/plugins/events/scene";
import Scene from "../../../src/types/scene";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";

describe("plugins", () => {
  describe("events", () => {
    describe("scene", () => {
      CONFIG_FIXTURES.forEach((configFixture) => {
        const scenePluginFixture = require(path.resolve(
          configFixture.config.plugins.register[
            `scene_plugin_fixture_${configFixture.name === "TS" ? "ts" : "js"}`
          ].path
        ));

        before(async () => {
          await initPluginsConfig(configFixture.path, configFixture.config);
        });

        after(async () => {
          await cleanupPluginsConfig();
        });

        ["sceneCreated", "sceneCustom"].forEach((event: string) => {
          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async () => {
            const initialName = "initial scene name";
            let scene = new Scene(initialName);

            expect(scene.name).to.equal(initialName);

            expect(scene.name).to.not.equal(scenePluginFixture.result.name);
            expect(scene.path).to.not.equal(scenePluginFixture.result.path);
            expect(scene.description).to.not.equal(scenePluginFixture.result.description);
            expect(scene.releaseDate).to.not.equal(scenePluginFixture.result.releaseDate);
            expect(scene.rating).to.not.equal(scenePluginFixture.result.rating);
            expect(scene.favorite).to.not.equal(scenePluginFixture.result.favorite);
            expect(scene.bookmark).to.not.equal(scenePluginFixture.result.bookmark);

            scene = await onSceneCreate(scene, [], [], event);

            expect(scene.name).to.equal(scenePluginFixture.result.name);
            expect(scene.path).to.equal(scenePluginFixture.result.path);
            expect(scene.description).to.equal(scenePluginFixture.result.description);
            expect(scene.releaseDate).to.equal(scenePluginFixture.result.releaseDate);
            expect(scene.rating).to.equal(scenePluginFixture.result.rating);
            expect(scene.favorite).to.equal(scenePluginFixture.result.favorite);
            expect(scene.bookmark).to.equal(scenePluginFixture.result.bookmark);
          });
        });
      });
    });
  });
});
