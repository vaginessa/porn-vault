import { expect } from 'chai';

import { actorCollection, labelCollection } from '../../../src/database';
import sceneMutations from '../../../src/graphql/mutations/scene';
import { indexActors } from '../../../src/search/actor';
import { indexScenes } from '../../../src/search/scene';
import Actor from '../../../src/types/actor';
import Label from '../../../src/types/label';
import Scene from '../../../src/types/scene';
import { startTestServer, stopTestServer } from '../../testServer';
import { ApplyActorLabelsEnum } from './../../../src/config/schema';
import { sceneCollection } from './../../../src/database';

describe.only("graphql", () => {
  describe("mutations", () => {
    describe("scene", () => {
      const sceneFilename = "dynamic_image001.jpg";

      async function seedDb() {
        const actorLabel = new Label("def label");
        expect(await Label.getAll()).to.be.empty;
        await labelCollection.upsert(actorLabel._id, actorLabel);
        expect(await Label.getAll()).to.have.lengthOf(1);

        const seedActor = new Actor("abc actor");
        await actorCollection.upsert(seedActor._id, seedActor);
        await indexActors([seedActor]);

        await Actor.setLabels(seedActor, [actorLabel._id]);
        const actorLabels = await Actor.getLabels(seedActor);
        expect(actorLabels).to.have.lengthOf(1);

        return {
          seedActor,
          actorLabel,
        };
      }

      async function seedDbWithScene() {
        const { seedActor, actorLabel } = await seedDb();
        const seedScene = new Scene("seed_scene");

        expect(await Scene.getAll()).to.be.empty;
        await sceneCollection.upsert(seedScene._id, seedScene);
        await indexScenes([seedScene]);
        expect(await Scene.getAll()).to.have.lengthOf(1);

        const updateLabel = new Label("ghi label");
        await labelCollection.upsert(updateLabel._id, updateLabel);
        expect(await Label.getAll()).to.have.lengthOf(2);

        // Image labels are not attached to image,
        // since we manually set the actors and labels
        expect(await Scene.getActors(seedScene)).to.have.lengthOf(0);
        expect(await Scene.getLabels(seedScene)).to.have.lengthOf(0);

        return {
          seedScene,
          seedActor,
          actorLabel,
          updateLabel,
        };
      }

      afterEach(() => {
        stopTestServer();
      });

      describe("addScene", () => {
        it("when applyActorLabels does not include creation, attaches actor, adds no labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [],
            },
          });
          const { seedActor } = await seedDb();

          const addScene = {
            name: sceneFilename,
            actors: [seedActor._id],
            labels: [],
          };

          const outputScene = await sceneMutations.addScene(null, addScene);

          expect(outputScene.name).to.equal(addScene.name);

          const sceneActors = await Scene.getActors(outputScene);
          expect(sceneActors).to.have.lengthOf(1);
          expect(sceneActors[0]._id).to.equal(seedActor._id);

          expect(await Scene.getLabels(outputScene)).to.have.lengthOf(0);
        });

        it("when applyActorLabels includes creation, attaches actor, adds labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [ApplyActorLabelsEnum.enum.sceneCreate],
            },
          });
          const { seedActor, actorLabel } = await seedDb();

          const addScene = {
            name: sceneFilename,
            actors: [seedActor._id],
            labels: [],
          };

          const outputScene = await sceneMutations.addScene(null, addScene);

          expect(outputScene.name).to.equal(addScene.name);

          const sceneActors = await Scene.getActors(outputScene);
          expect(sceneActors).to.have.lengthOf(1);
          expect(sceneActors[0]._id).to.equal(seedActor._id);

          const sceneLabels = await Scene.getLabels(outputScene);
          expect(sceneLabels).to.have.lengthOf(1);
          expect(sceneLabels[0]._id).to.equal(actorLabel._id);
        });
      });

      describe("updateScenes", () => {
        it("when applyActorLabels does not include update, when name in path, attaches actor, adds no labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [],
            },
          });
          const { seedScene, seedActor, updateLabel } = await seedDbWithScene();

          const opts = {
            name: `${sceneFilename} update`,
            rating: 0,
            labels: [updateLabel._id],
            actors: [seedActor._id],
            favorite: false,
            studio: null,
            scene: null,
            customFields: undefined,
            color: null,
          };

          const outputScenes = await sceneMutations.updateScenes(null, {
            ids: [seedScene._id],
            opts,
          });

          expect(outputScenes).to.have.lengthOf(1);
          const outputScene = outputScenes[0];
          expect(outputScene.name).to.equal(opts.name);

          expect(await Scene.getActors(seedScene)).to.have.lengthOf(1);

          const sceneLabels = await Scene.getLabels(outputScene);
          expect(sceneLabels).to.have.lengthOf(1);
          // Only contains our direct label, not the actor label
          expect(sceneLabels[0]._id).to.equal(updateLabel._id);
        });

        it("when applyActorLabels includes update, when name in path, attaches actor, adds labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [ApplyActorLabelsEnum.enum.sceneUpdate],
            },
          });
          const { seedScene, seedActor, actorLabel, updateLabel } = await seedDbWithScene();

          const opts = {
            name: `${sceneFilename} update`,
            rating: 0,
            labels: [updateLabel._id],
            actors: [seedActor._id],
            favorite: false,
            studio: null,
            scene: null,
            customFields: undefined,
            color: null,
          };

          const outputScenes = await sceneMutations.updateScenes(null, {
            ids: [seedScene._id],
            opts,
          });

          expect(outputScenes).to.have.lengthOf(1);
          const outputScene = outputScenes[0];
          expect(outputScene.name).to.equal(opts.name);

          expect(await Scene.getActors(seedScene)).to.have.lengthOf(1);

          const sceneLabels = await Scene.getLabels(outputScene);
          expect(sceneLabels).to.have.lengthOf(2);
          // Contains both our update label and the actor label
          expect(!!sceneLabels.find((l) => l._id === actorLabel._id)).to.be.true;
          expect(!!sceneLabels.find((l) => l._id === updateLabel._id)).to.be.true;
        });
      });
    });
  });
});
