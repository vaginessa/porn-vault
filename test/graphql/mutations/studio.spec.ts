import { expect } from "chai";

import { collections } from "../../../src/database";
import studioMutations from "../../../src/graphql/mutations/studio";
import { indexScenes } from "../../../src/search/scene";
import { indexStudios } from "../../../src/search/studio";
import Label from "../../../src/types/label";
import Scene from "../../../src/types/scene";
import Studio from "../../../src/types/studio";
import { startTestServer, stopTestServer } from "../../testServer";
import { ApplyStudioLabelsEnum } from "./../../../src/config/schema";

describe("graphql", () => {
  describe("mutations", () => {
    describe("studio", () => {
      const videoPathWithStudio = "./test/fixtures/files/dynamic/dynamic_video001_abc_studio_updated.mp4";
      const videoPathWithoutStudio = "./test/fixtures/files/dynamic/dynamic_video001.mp4";

      async function seedDb() {
        const sceneWithStudioInPath = new Scene("scene_with_name");
        sceneWithStudioInPath.path = videoPathWithStudio;
        const sceneWithoutStudioInPath = new Scene("scene_without_name");
        sceneWithoutStudioInPath.path = videoPathWithoutStudio;

        expect(await Scene.getAll()).to.be.empty;
        await collections.scenes.upsert(sceneWithStudioInPath._id, sceneWithStudioInPath);
        await collections.scenes.upsert(sceneWithoutStudioInPath._id, sceneWithoutStudioInPath);

        await indexScenes([sceneWithStudioInPath, sceneWithoutStudioInPath]);
        expect(await Scene.getAll()).to.have.lengthOf(2);

        const seedLabel = new Label("def label");
        expect(await Label.getAll()).to.be.empty;
        await collections.labels.upsert(seedLabel._id, seedLabel);
        expect(await Label.getAll()).to.have.lengthOf(1);

        return {
          sceneWithStudioInPath,
          sceneWithoutStudioInPath,
          seedLabel,
        };
      }

      async function seedDbWithStudio() {
        const { sceneWithStudioInPath, sceneWithoutStudioInPath, seedLabel } = await seedDb();

        const seedStudio = new Studio("abc studio");
        await collections.studios.upsert(seedStudio._id, seedStudio);
        await indexStudios([seedStudio]);

        await Studio.setLabels(seedStudio, [seedLabel._id]);
        const studioLabels = await Studio.getLabels(seedStudio);
        expect(studioLabels).to.have.lengthOf(1);

        const updateLabel = new Label("jkl label");
        await collections.labels.upsert(updateLabel._id, updateLabel);
        expect(await Label.getAll()).to.have.lengthOf(2);

        // Studio labels are not attached to scene, since we manually set the labels
        expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);
        expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);

        return {
          sceneWithStudioInPath,
          sceneWithoutStudioInPath,
          seedStudio,
          seedLabel,
          updateLabel,
        };
      }

      afterEach(() => {
        stopTestServer();
      });

      describe("addStudio", () => {
        it("creates studio, attaches to scenes", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [],
            },
          });
          const { sceneWithStudioInPath, sceneWithoutStudioInPath, seedLabel } = await seedDb();

          const inputStudio = {
            name: "abc studio",
            labels: [seedLabel._id],
          };

          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);

          const outputStudio = await studioMutations.addStudio(null, inputStudio);

          expect(outputStudio.name).to.equal(inputStudio.name);
          const studioLabels = await Studio.getLabels(outputStudio);
          expect(studioLabels).to.have.lengthOf(1);
          expect(studioLabels[0]._id).to.equal(seedLabel._id);

          // Did attach studio
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            outputStudio._id
          );
          expect(((await Scene.getById(sceneWithoutStudioInPath._id)) as Scene).studio).to.be.null;
          // Did not attach labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);
        });

        it("creates studio, attaches to scenes, pushes labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [ApplyStudioLabelsEnum.enum["event:studio:create"]],
            },
          });
          const { sceneWithStudioInPath, sceneWithoutStudioInPath, seedLabel } = await seedDb();

          const inputStudio = {
            name: "abc studio",
            labels: [seedLabel._id],
          };

          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);

          const outputStudio = await studioMutations.addStudio(null, inputStudio);

          expect(outputStudio.name).to.equal(inputStudio.name);
          const studioLabels = await Studio.getLabels(outputStudio);
          expect(studioLabels).to.have.lengthOf(1);
          expect(studioLabels[0]._id).to.equal(seedLabel._id);

          // Did attach studio
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            outputStudio._id
          );
          expect(((await Scene.getById(sceneWithoutStudioInPath._id)) as Scene).studio).to.be.null;
          // Did push labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(1);
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);
        });
      });

      describe("findUnmatchedScenes", () => {
        it("attaches to scene, when labels did change + applyStudioLabels disabled: does not push labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [],
            },
          });
          const {
            sceneWithStudioInPath,
            sceneWithoutStudioInPath,
            seedStudio,
          } = await seedDbWithStudio();

          const res = await studioMutations.attachStudioToUnmatchedScenes(null, {
            id: seedStudio._id,
          });
          expect(res).to.not.be.null;

          // Did attach studio
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            seedStudio._id
          );
          // Did not push labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);

          expect(((await Scene.getById(sceneWithoutStudioInPath._id)) as Scene).studio).to.be.null;
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);
        });

        it("attaches to scene, when labels did change + applyStudioLabels enabled: does push labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [
                ApplyStudioLabelsEnum.enum["event:studio:find-unmatched-scenes"],
              ],
            },
          });
          const {
            sceneWithStudioInPath,
            sceneWithoutStudioInPath,
            seedStudio,
          } = await seedDbWithStudio();

          const res = await studioMutations.attachStudioToUnmatchedScenes(null, {
            id: seedStudio._id,
          });
          expect(res).to.not.be.null;

          // Did attach studio
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            seedStudio._id
          );
          // Did push labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(1);

          expect(((await Scene.getById(sceneWithoutStudioInPath._id)) as Scene).studio).to.be.null;
          expect(await Scene.getLabels(sceneWithoutStudioInPath)).to.have.lengthOf(0);
        });
      });

      describe("updateStudio", () => {
        it("when labels did change + applyStudioLabels disabled: does not push labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [],
            },
          });
          const {
            sceneWithStudioInPath,
            seedStudio,
            seedLabel,
            updateLabel,
          } = await seedDbWithStudio();

          const opts = {
            description: "new description",
            labels: [seedLabel._id, updateLabel._id],
          };

          const res = await studioMutations.attachStudioToUnmatchedScenes(null, {
            id: seedStudio._id,
          });
          expect(res).to.not.be.null;
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            seedStudio._id
          );

          const outputStudios = await studioMutations.updateStudios(null, {
            ids: [seedStudio._id],
            opts,
          });

          expect(outputStudios).to.have.lengthOf(1);
          const outputStudio = outputStudios[0];
          expect(outputStudio.description).to.equal(opts.description);
          const studioLabels = await Studio.getLabels(outputStudio);
          expect(studioLabels).to.have.lengthOf(2);
          expect(!!studioLabels.find((l) => l._id === seedLabel._id)).to.be.true;
          expect(!!studioLabels.find((l) => l._id === updateLabel._id)).to.be.true;

          // Did not push labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(0);
        });

        it("when labels did change + applyStudioLabels enabled: pushes labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyStudioLabels: [ApplyStudioLabelsEnum.enum["event:studio:update"]],
            },
          });
          const {
            sceneWithStudioInPath,
            seedStudio,
            seedLabel,
            updateLabel,
          } = await seedDbWithStudio();

          const opts = {
            name: "abc studio updated",
            description: "new description",
            labels: [seedLabel._id, updateLabel._id],
          };

          const res = await studioMutations.attachStudioToUnmatchedScenes(null, {
            id: seedStudio._id,
          });
          expect(res).to.not.be.null;
          expect(((await Scene.getById(sceneWithStudioInPath._id)) as Scene).studio).to.equal(
            seedStudio._id
          );

          const outputStudios = await studioMutations.updateStudios(null, {
            ids: [seedStudio._id],
            opts,
          });

          expect(outputStudios).to.have.lengthOf(1);
          const outputStudio = outputStudios[0];
          expect(outputStudio.description).to.equal(opts.description);
          const studioLabels = await Studio.getLabels(outputStudio);
          expect(studioLabels).to.have.lengthOf(2);
          expect(!!studioLabels.find((l) => l._id === seedLabel._id)).to.be.true;
          expect(!!studioLabels.find((l) => l._id === updateLabel._id)).to.be.true;

          // Did push labels
          expect(await Scene.getLabels(sceneWithStudioInPath)).to.have.lengthOf(2);
        });
      });
    });
  });
});
