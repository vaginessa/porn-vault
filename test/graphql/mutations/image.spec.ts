import { expect } from "chai";
import { createReadStream, existsSync, unlinkSync } from "fs";
import { before } from "mocha";

import { collections } from "../../../src/database";
import imageMutations from "../../../src/graphql/mutations/image";
import { indexActors } from "../../../src/search/actor";
import { indexImages } from "../../../src/search/image";
import Actor from "../../../src/types/actor";
import Image from "../../../src/types/image";
import Label from "../../../src/types/label";
import { downloadRandomImage } from "../../fixtures/files/dynamicTestFiles";
import { startTestServer, stopTestServer } from "../../testServer";
import { ApplyActorLabelsEnum } from "./../../../src/config/schema";

describe("graphql", () => {
  describe("mutations", () => {
    describe("image", () => {
      const imageFilename = "dynamic_image001.jpg";
      const imagePath = `./test/fixtures/files/${imageFilename}`;

      async function seedDb() {
        const actorLabel = new Label("def label");
        expect(await Label.getAll()).to.be.empty;
        await collections.labels.upsert(actorLabel._id, actorLabel);
        expect(await Label.getAll()).to.have.lengthOf(1);

        const seedActor = new Actor("abc actor");
        await collections.actors.upsert(seedActor._id, seedActor);
        await indexActors([seedActor]);

        await Actor.setLabels(seedActor, [actorLabel._id]);
        const actorLabels = await Actor.getLabels(seedActor);
        expect(actorLabels).to.have.lengthOf(1);

        const seedFile = {
          filename: imageFilename,
          mimetype: "image/jpeg",
          createReadStream: () => createReadStream(imagePath),
        };

        return {
          seedFile,
          seedActor,
          actorLabel,
        };
      }

      async function seedDbWithImage() {
        const { seedActor, actorLabel } = await seedDb();
        const seedImage = new Image("seed_image");
        seedImage.path = imagePath;

        expect(await Image.getAll()).to.be.empty;
        await collections.images.upsert(seedImage._id, seedImage);
        await indexImages([seedImage]);
        expect(await Image.getAll()).to.have.lengthOf(1);

        const updateLabel = new Label("ghi label");
        await collections.labels.upsert(updateLabel._id, updateLabel);
        expect(await Label.getAll()).to.have.lengthOf(2);

        // Image labels are not attached to image,
        // since we manually set the actors and labels
        expect(await Image.getActors(seedImage)).to.have.lengthOf(0);
        expect(await Image.getLabels(seedImage)).to.have.lengthOf(0);

        return {
          seedImage,
          seedActor,
          actorLabel,
          updateLabel,
        };
      }

      before(async () => {
        await downloadRandomImage(imagePath);
      });

      after(() => {
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      });

      afterEach(() => {
        stopTestServer();
      });

      describe("uploadImage", () => {
        it("when applyActorLabels does not include creation, attaches actor, adds no labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [],
            },
          });
          const { seedFile, seedActor } = await seedDb();

          const uploadImage = {
            file: Promise.resolve(seedFile),
            name: imageFilename,
            actors: [seedActor._id],
            labels: [],
          };

          const outputImage = await imageMutations.uploadImage(null, uploadImage);

          expect(outputImage.name).to.equal(uploadImage.name);

          const imageActors = await Image.getActors(outputImage);
          expect(imageActors).to.have.lengthOf(1);
          expect(imageActors[0]._id).to.equal(seedActor._id);

          expect(await Image.getLabels(outputImage)).to.have.lengthOf(0);
        });

        it("when applyActorLabels includes creation, attaches actor, adds labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [ApplyActorLabelsEnum.enum["event:image:create"]],
            },
          });
          const { seedFile, seedActor, actorLabel } = await seedDb();

          const uploadImage = {
            file: Promise.resolve(seedFile),
            name: imageFilename,
            actors: [seedActor._id],
            labels: [],
          };

          const outputImage = await imageMutations.uploadImage(null, uploadImage);

          expect(outputImage.name).to.equal(uploadImage.name);

          const imageActors = await Image.getActors(outputImage);
          expect(imageActors).to.have.lengthOf(1);
          expect(imageActors[0]._id).to.equal(seedActor._id);

          const imageLabels = await Image.getLabels(outputImage);
          expect(imageLabels).to.have.lengthOf(1);
          expect(imageLabels[0]._id).to.equal(actorLabel._id);
        });
      });

      describe("updateImage", () => {
        it("when applyActorLabels does not include update, when name in path, attaches actor, adds no labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [],
            },
          });
          const { seedImage, seedActor, updateLabel } = await seedDbWithImage();

          const opts = {
            name: `${imageFilename} update`,
            rating: 0,
            labels: [updateLabel._id],
            actors: [seedActor._id],
            favorite: false,
            bookmark: null,
            studio: null,
            scene: null,
            customFields: undefined,
            color: null,
          };

          const outputImages = await imageMutations.updateImages(null, {
            ids: [seedImage._id],
            opts,
          });

          expect(outputImages).to.have.lengthOf(1);
          const outputImage = outputImages[0];
          expect(outputImage.name).to.equal(opts.name);

          expect(await Image.getActors(seedImage)).to.have.lengthOf(1);

          const imageLabels = await Image.getLabels(outputImage);
          expect(imageLabels).to.have.lengthOf(1);
          // Only contains our direct label, not the actor label
          expect(imageLabels[0]._id).to.equal(updateLabel._id);
        });

        it("when applyActorLabels includes update, when name in path, attaches actor, adds labels", async function () {
          await startTestServer.call(this, {
            matching: {
              applyActorLabels: [ApplyActorLabelsEnum.enum["event:image:update"]],
            },
          });
          const { seedImage, seedActor, actorLabel, updateLabel } = await seedDbWithImage();

          const opts = {
            name: `${imageFilename} update`,
            rating: 0,
            labels: [updateLabel._id],
            actors: [seedActor._id],
            favorite: false,
            bookmark: null,
            studio: null,
            scene: null,
            customFields: undefined,
            color: null,
          };

          const outputImages = await imageMutations.updateImages(null, {
            ids: [seedImage._id],
            opts,
          });

          expect(outputImages).to.have.lengthOf(1);
          const outputImage = outputImages[0];
          expect(outputImage.name).to.equal(opts.name);

          expect(await Image.getActors(seedImage)).to.have.lengthOf(1);

          const imageLabels = await Image.getLabels(outputImage);
          expect(imageLabels).to.have.lengthOf(2);
          // Contains both our update label and the actor label
          expect(!!imageLabels.find((l) => l._id === actorLabel._id)).to.be.true;
          expect(!!imageLabels.find((l) => l._id === updateLabel._id)).to.be.true;
        });
      });
    });
  });
});
