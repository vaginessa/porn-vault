import "mocha";

import { expect } from "chai";
import path from "path";

import { ApplyActorLabelsEnum } from "../../../src/config/schema";
import { onSceneCreate } from "../../../src/plugins/events/scene";
import Actor from "../../../src/types/actor";
import Image from "../../../src/types/image";
import Label from "../../../src/types/label";
import Scene from "../../../src/types/scene";
import { startTestServer, stopTestServer } from "../../testServer";
import { CONFIG_FIXTURES } from "../initPluginFixtures";
import { actorCollection, labelCollection } from "./../../../src/database";
import { indexActors } from "../../../src/search/actor";

describe("plugins", () => {
  describe("events", () => {
    describe("scene", () => {
      afterEach(() => {
        stopTestServer();
      });

      CONFIG_FIXTURES.forEach((configFixture) => {
        ["sceneCreated", "sceneCustom"].forEach((ev: string) => {
          const event: "sceneCreated" | "sceneCustom" = ev as any;
          const pluginNames = configFixture.config.plugins.events[event];
          expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

          const scenePluginFixture = require(path.resolve(
            configFixture.config.plugins.register[pluginNames[0]].path
          ));

          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async function () {
            await startTestServer.call(this, {
              plugins: configFixture.config.plugins,
            });

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
            expect(scene.thumbnail).to.be.null;

            scene = await onSceneCreate(scene, [], [], event);

            expect(scene.name).to.equal(scenePluginFixture.result.name);
            expect(scene.path).to.equal(scenePluginFixture.result.path);
            expect(scene.description).to.equal(scenePluginFixture.result.description);
            expect(scene.releaseDate).to.equal(scenePluginFixture.result.releaseDate);
            expect(scene.addedOn).to.equal(scenePluginFixture.result.addedOn);
            expect(scene.rating).to.equal(scenePluginFixture.result.rating);
            expect(scene.favorite).to.equal(scenePluginFixture.result.favorite);
            expect(scene.bookmark).to.equal(scenePluginFixture.result.bookmark);
            expect(scene.thumbnail).to.be.a("string");
          });

          describe("labels", () => {
            it(`config ${configFixture.name}: event '${event}': when applyActorLabels does not include scenePluginCreated,scenePluginCustom does not add labels`, async function () {
              await startTestServer.call(this, {
                plugins: configFixture.config.plugins,
                matching: {
                  applyActorLabels: [],
                },
              });

              expect(await Image.getAll()).to.be.empty;
              const seedLabel = new Label("dummy label");
              await labelCollection.upsert(seedLabel._id, seedLabel);

              expect(await Actor.getAll()).to.be.empty;
              // same name as name returned from scene plugin
              const seedActor = new Actor("existing actor name");
              await actorCollection.upsert(seedActor._id, seedActor);
              await Actor.setLabels(seedActor, [seedLabel._id]);
              await indexActors([seedActor]);

              let scene = new Scene("initial scene name");

              scene = await onSceneCreate(scene, [], [], event);
              expect(scene.thumbnail).to.be.a("string");

              // Plugin created 1 image, 1 thumbnail
              const images = await Image.getAll();
              expect(images).to.have.lengthOf(2);

              // Did not attach actor labels to any images
              for (const image of images) {
                expect(await Image.getLabels(image)).to.be.empty;
              }
            });

            it(`config ${configFixture.name}: event '${event}': when applyActorLabels includes scenePluginCreated,scenePluginCustom adds labels`, async function () {
              await startTestServer.call(this, {
                plugins: configFixture.config.plugins,
                matching: {
                  applyActorLabels: [
                    ApplyActorLabelsEnum.enum.scenePluginCreated,
                    ApplyActorLabelsEnum.enum.scenePluginCustom,
                  ],
                },
              });

              expect(await Image.getAll()).to.be.empty;
              const seedLabel = new Label("dummy label");
              await labelCollection.upsert(seedLabel._id, seedLabel);

              expect(await Actor.getAll()).to.be.empty;
              // same name as name returned from scene plugin
              const seedActor = new Actor("existing actor name");
              await actorCollection.upsert(seedActor._id, seedActor);
              await Actor.setLabels(seedActor, [seedLabel._id]);
              await indexActors([seedActor]);

              let scene = new Scene("initial scene name");
              expect(scene.thumbnail).to.be.null;

              scene = await onSceneCreate(scene, [], [], event);
              expect(scene.thumbnail).to.be.a("string");

              // Plugin created 1 image, 1 thumbnail
              const images = await Image.getAll();
              expect(images).to.have.lengthOf(2);

              // Did attach actor labels to images
              for (const image of images) {
                // Only non thumbnail images are indexed and could be applied labels
                if (!image.name.includes("thumbnail")) {
                  const imageLabels = await Image.getLabels(image);
                  expect(imageLabels).to.have.lengthOf(1);
                  expect(imageLabels[0]._id).to.equal(seedLabel._id);
                }
              }
            });
          });
        });
      });
    });
  });
});
