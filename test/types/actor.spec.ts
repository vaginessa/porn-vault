import { expect } from "chai";
import { existsSync, unlinkSync } from "fs";
import { before } from "mocha";

import { indexActors } from "../../src/search/actor";
import { indexScenes } from "../../src/search/scene";
import Actor from "../../src/types/actor";
import Label from "../../src/types/label";
import Scene from "../../src/types/scene";
import { downloadTestVideo } from "../fixtures/files/dynamicTestFiles";
import { startTestServer, stopTestServer } from "../testServer";
import { actorCollection, labelCollection, sceneCollection } from "./../../src/database";

describe("types", () => {
  describe("actor", () => {
    describe("attachToScenes", () => {
      const videoPathWithActor = "./test/fixtures/files/dynamic_video001_abc_actor.mp4";
      const videoPathWithoutActor = "./test/fixtures/files/dynamic_video001.mp4";

      let sceneWithActorInPath = new Scene("scene_with_name");
      sceneWithActorInPath.path = videoPathWithActor;
      let sceneWithoutActorInPath = new Scene("scene_without_name");
      sceneWithoutActorInPath.path = videoPathWithoutActor;
      const seedActor = new Actor("abc actor");
      const seedLabel = new Label("def label");

      async function seedDb(setActorLabel: boolean) {
        if (setActorLabel) {
          expect(await Label.getAll()).to.be.empty;
          await labelCollection.upsert(seedLabel._id, seedLabel);
          expect(await Label.getAll()).to.have.lengthOf(1);
          await Actor.setLabels(seedActor, [seedLabel._id]);
          expect(await Actor.getLabels(seedActor)).to.have.lengthOf(1);
        }
        expect(await Actor.getAll()).to.be.empty;
        await actorCollection.upsert(seedActor._id, seedActor);
        await indexActors([seedActor]);
        expect(await Actor.getAll()).to.have.lengthOf(1);

        expect(await Scene.getAll()).to.be.empty;
        // Only set the actor on the scene without its name in the path, to test the update
        Scene.setActors(sceneWithoutActorInPath, [seedActor._id]);
        await sceneCollection.upsert(sceneWithActorInPath._id, sceneWithActorInPath);
        await sceneCollection.upsert(sceneWithoutActorInPath._id, sceneWithoutActorInPath);

        await indexScenes([sceneWithActorInPath, sceneWithoutActorInPath]);
        expect(await Scene.getAll()).to.have.lengthOf(2);
      }

      before(async () => {
        await downloadTestVideo(videoPathWithActor);
        await downloadTestVideo(videoPathWithoutActor);
      });

      after(() => {
        if (existsSync(videoPathWithActor)) {
          unlinkSync(videoPathWithActor);
        }
        if (existsSync(videoPathWithoutActor)) {
          unlinkSync(videoPathWithoutActor);
        }
      });

      afterEach(() => {
        stopTestServer();
      });

      it("without labels, adds no labels to new scene", async function () {
        await startTestServer.call(this);
        await seedDb(false);

        expect(await Scene.getLabels(sceneWithActorInPath)).to.have.lengthOf(0);

        const actorLabels = (await Actor.getLabels(seedActor)).map((l) => l._id);
        await Actor.attachToScenes(seedActor, actorLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithActorInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(0);
      });

      it("with labels, adds labels to new scene", async function () {
        await startTestServer.call(this);
        await seedDb(true);

        expect(await Scene.getLabels(sceneWithActorInPath)).to.have.lengthOf(0);

        const actorLabels = (await Actor.getLabels(seedActor)).map((l) => l._id);
        // Should attach labels to scene, since actor name is in path
        await Actor.attachToScenes(seedActor, actorLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithActorInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(1);
        expect(sceneLabels[0]).to.equal(actorLabels[0]);
      });

      it("when scene does not match actor, when no labels, updates existing scene, adds no labels", async function () {
        await startTestServer.call(this);
        await seedDb(false);

        expect(await Scene.getLabels(sceneWithoutActorInPath)).to.have.lengthOf(0);

        const actorLabels = (await Actor.getLabels(seedActor)).map((l) => l._id);
        await Actor.attachToScenes(seedActor, actorLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithoutActorInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(0);
      });

      it("when scene does not match actor, with labels, updates existing scene, adds labels", async function () {
        await startTestServer.call(this);
        await seedDb(true);

        expect(await Scene.getLabels(sceneWithoutActorInPath)).to.have.lengthOf(0);

        const actorLabels = (await Actor.getLabels(seedActor)).map((l) => l._id);
        // Should attach labels to scene, since actor is already linked to scene, even if not in path
        await Actor.attachToScenes(seedActor, actorLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithoutActorInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(1);
        expect(sceneLabels[0]).to.equal(actorLabels[0]);
      });
    });
  });
});
