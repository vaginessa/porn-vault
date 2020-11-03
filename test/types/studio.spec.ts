import { expect } from "chai";
import { existsSync, unlinkSync } from "fs";
import { before } from "mocha";

import { indexScenes } from "../../src/search/scene";
import { indexStudios } from "../../src/search/studio";
import Label from "../../src/types/label";
import Scene from "../../src/types/scene";
import Studio from "../../src/types/studio";
import { downloadTestVideo } from "../fixtures/files/dynamicTestFiles";
import { startTestServer, stopTestServer } from "../testServer";
import { labelCollection, sceneCollection, studioCollection } from "./../../src/database";

describe("types", () => {
  describe("studio", () => {
    describe("attachToScenes", () => {
      const videoPathWithStudio = "./test/fixtures/files/dynamic_video001_abc_studio.mp4";
      const videoPathWithoutStudio = "./test/fixtures/files/dynamic_video001.mp4";

      let sceneWithStudioInPath = new Scene("scene_with_name");
      sceneWithStudioInPath.path = videoPathWithStudio;
      let sceneWithoutStudioInPath = new Scene("scene_without_name");
      sceneWithoutStudioInPath.path = videoPathWithoutStudio;
      const seedStudio = new Studio("abc studio");
      const seedLabel = new Label("def label");

      async function seedDb(setStudioLabel: boolean) {
        if (setStudioLabel) {
          expect(await Label.getAll()).to.be.empty;
          await labelCollection.upsert(seedLabel._id, seedLabel);
          expect(await Label.getAll()).to.have.lengthOf(1);

          await Studio.setLabels(seedStudio, [seedLabel._id]);
          expect(await Studio.getLabels(seedStudio)).to.have.lengthOf(1);
        }
        expect(await Studio.getAll()).to.be.empty;
        await studioCollection.upsert(seedStudio._id, seedStudio);
        await indexStudios([seedStudio]);
        expect(await Studio.getAll()).to.have.lengthOf(1);

        expect(await Scene.getAll()).to.be.empty;
        // Only set the studio on the scene without its name in the path, to test the update
        sceneWithoutStudioInPath.studio = seedStudio._id;
        await sceneCollection.upsert(sceneWithStudioInPath._id, sceneWithStudioInPath);
        await sceneCollection.upsert(sceneWithoutStudioInPath._id, sceneWithoutStudioInPath);

        await indexScenes([sceneWithStudioInPath, sceneWithoutStudioInPath]);
        expect(await Scene.getAll()).to.have.lengthOf(2);
      }

      before(async () => {
        await downloadTestVideo(videoPathWithStudio);
        await downloadTestVideo(videoPathWithoutStudio);
      });

      after(() => {
        if (existsSync(videoPathWithStudio)) {
          unlinkSync(videoPathWithStudio);
        }
        if (existsSync(videoPathWithoutStudio)) {
          unlinkSync(videoPathWithoutStudio);
        }
      });

      afterEach(() => {
        stopTestServer();
      });

      it("without labels, adds no labels to new scene", async function () {
        await startTestServer.call(this);
        await seedDb(false);

        expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);

        const studioLabels = (await Studio.getLabels(seedStudio)).map((l) => l._id);
        await Studio.attachToScenes(seedStudio, studioLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithStudioInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(0);
      });

      it("with labels, adds labels to new scene", async function () {
        await startTestServer.call(this);
        await seedDb(true);

        expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);

        const studioLabels = (await Studio.getLabels(seedStudio)).map((l) => l._id);
        // Should attach labels to scene, since studio name is in path
        await Studio.attachToScenes(seedStudio, studioLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithStudioInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(1);
        expect(sceneLabels[0]).to.equal(studioLabels[0]);
      });

      it("when scene does not match studio, when no labels, updates existing scene, adds no labels", async function () {
        await startTestServer.call(this);
        await seedDb(false);

        expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);

        const studioLabels = (await Studio.getLabels(seedStudio)).map((l) => l._id);
        await Studio.attachToScenes(seedStudio, studioLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithoutStudioInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(0);
      });

      it("when scene does not match studio, with labels, updates existing scene, adds labels", async function () {
        await startTestServer.call(this);
        await seedDb(true);

        expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);

        const studioLabels = (await Studio.getLabels(seedStudio)).map((l) => l._id);
        // Should attach labels to scene, since studio is already linked to scene, even if not in path
        await Studio.attachToScenes(seedStudio, studioLabels);

        const sceneLabels = (await Scene.getLabels(sceneWithoutStudioInPath)).map((l) => l._id);
        expect(sceneLabels).to.have.lengthOf(1);
        expect(sceneLabels[0]).to.equal(studioLabels[0]);
      });
    });
  });
});
