import "mocha";

import { expect } from "chai";
import path from "path";

import { onActorCreate } from "../../../src/plugins/events/actor";
import Actor from "../../../src/types/actor";
import Image from "../../../src/types/image";
import Label from "../../../src/types/label";
import { startTestServer, stopTestServer } from "../../testServer";
import { CONFIG_FIXTURES } from "../initPluginFixtures";
import { labelCollection } from "./../../../src/database";
import { ApplyActorLabelsEnum } from "../../../src/config/schema";

describe("plugins", () => {
  describe("events", () => {
    describe("actor", () => {
      afterEach(() => {
        stopTestServer();
      });

      CONFIG_FIXTURES.forEach((configFixture) => {
        ["actorCreated", "actorCustom"].forEach((ev: string) => {
          const event: "actorCreated" | "actorCustom" = ev as any;
          const pluginNames = configFixture.config.plugins.events[event];
          expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

          const actorPluginFixture = require(path.resolve(
            configFixture.config.plugins.register[pluginNames[0]].path
          ));

          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async function () {
            await startTestServer.call(this, {
              plugins: configFixture.config.plugins,
            });

            const initialName = "initial actor name";
            const initialAliases = [];
            let actor = new Actor(initialName, initialAliases);

            expect(actor.name).to.equal(initialName);
            expect(actor.aliases).to.deep.equal(initialAliases);

            expect(actor.name).to.not.equal(actorPluginFixture.result.name);
            expect(actor.bornOn).to.not.equal(actorPluginFixture.result.bornOn);
            expect(actor.aliases).to.not.deep.equal(actorPluginFixture.result.aliases);
            expect(actor.rating).to.not.equal(actorPluginFixture.result.rating);
            expect(actor.favorite).to.not.equal(actorPluginFixture.result.favorite);
            expect(actor.bookmark).to.not.equal(actorPluginFixture.result.bookmark);
            expect(actor.nationality).to.not.equal(actorPluginFixture.result.nationality);
            expect(actor.thumbnail).to.be.null;

            actor = await onActorCreate(actor, [], event);

            expect(actor.name).to.equal(actorPluginFixture.result.name);
            expect(actor.bornOn).to.equal(actorPluginFixture.result.bornOn);
            expect(actor.aliases).to.deep.equal(actorPluginFixture.result.aliases);
            expect(actor.rating).to.equal(actorPluginFixture.result.rating);
            expect(actor.favorite).to.equal(actorPluginFixture.result.favorite);
            expect(actor.bookmark).to.equal(actorPluginFixture.result.bookmark);
            expect(actor.nationality).to.equal(actorPluginFixture.result.nationality);
            expect(actor.thumbnail).to.be.a("string");
          });

          describe("labels", () => {
            it(`config ${configFixture.name}: event '${event}': when applyActorLabels does not include imageCreate, does not add labels`, async function () {
              await startTestServer.call(this, {
                plugins: configFixture.config.plugins,
                matching: {
                  applyActorLabels: [],
                },
              });

              expect(await Image.getAll()).to.be.empty;
              const seedLabel = new Label("dummy label");
              await labelCollection.upsert(seedLabel._id, seedLabel);

              let actor = new Actor("initial actor name", []);
              expect(actor.thumbnail).to.be.null;

              actor = await onActorCreate(actor, [seedLabel._id], event);
              expect(actor.thumbnail).to.be.a("string");

              // Plugin created 1 image, 1 thumbnail
              const images = await Image.getAll();
              expect(images).to.have.lengthOf(2);

              // Did not attach actor labels to any images
              for (const image of images) {
                expect(await Image.getLabels(image)).to.be.empty;
              }
            });

            it(`config ${configFixture.name}: event '${event}': when applyActorLabels includes imageCreate, adds labels`, async function () {
              await startTestServer.call(this, {
                plugins: configFixture.config.plugins,
                matching: {
                  applyActorLabels: [ApplyActorLabelsEnum.enum.imageCreate],
                },
              });

              expect(await Image.getAll()).to.be.empty;
              const seedLabel = new Label("dummy label");
              await labelCollection.upsert(seedLabel._id, seedLabel);

              let actor = new Actor("initial actor name", []);
              expect(actor.thumbnail).to.be.null;

              actor = await onActorCreate(actor, [seedLabel._id], event);
              expect(actor.thumbnail).to.be.a("string");

              // Plugin created 1 image, 1 thumbnail
              const images = await Image.getAll();
              expect(images).to.have.lengthOf(2);

              // Did not attach actor labels to images
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
