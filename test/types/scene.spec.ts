import { actorCollection } from "./../../src/database/index";
import { expect } from "chai";
import { existsSync, unlinkSync } from "fs";
import { before } from "mocha";
import Actor from "../../src/types/actor";

import Scene from "../../src/types/scene";
import { downloadTestVideo } from "../fixtures/files/dynamicTestFiles";
import { startTestServer, stopTestServer } from "../testServer";

describe.only("types", () => {
  describe("scene", () => {
    describe("onImport", () => {
      afterEach(() => {
        stopTestServer();
      });

      it("throws on invalid file", async function () {
        await startTestServer.call(this, {
          matching: {
            extractSceneActorsFromFilepath: false,
            extractSceneLabelsFromFilepath: false,
            extractSceneMoviesFromFilepath: false,
            extractSceneStudiosFromFilepath: false,
          },
        });

        const videoPath = "./test/fixtures/files/video001.mp4";

        let errored = false;

        try {
          await Scene.onImport(videoPath, false);
        } catch (err) {
          errored = true;
        }

        expect(errored).to.be.true;
      });

      describe("with real file", () => {
        const videoPath = "./test/fixtures/files/dynamic_video001_dummy_actor.mp4";

        before(async () => {
          await downloadTestVideo(videoPath);
        });

        after(() => {
          if (existsSync(videoPath)) {
            unlinkSync(videoPath);
          }
        });

        it("does not throw with real file", async function () {
          await startTestServer.call(this, {
            matching: {
              extractSceneActorsFromFilepath: false,
              extractSceneLabelsFromFilepath: false,
              extractSceneMoviesFromFilepath: false,
              extractSceneStudiosFromFilepath: false,
            },
          });

          let errored = false;

          try {
            await Scene.onImport(videoPath, false);
          } catch (err) {
            errored = true;
          }

          expect(errored).to.be.false;
        });

        it("does not run extraction when global bool is false", async function () {
          await startTestServer.call(this, {
            matching: {
              extractSceneActorsFromFilepath: false,
              extractSceneLabelsFromFilepath: false,
              extractSceneMoviesFromFilepath: false,
              extractSceneStudiosFromFilepath: false,
            },
          });

          const actor = new Actor("dummy actor");
          await actorCollection.upsert(actor._id, actor);

          let errored = false;

          try {
            await Scene.onImport(videoPath, false);
          } catch (err) {
            errored = true;
          }

          expect(errored).to.be.false;
        });

        it("does not run actor extraction when config bool is false", async function () {
          await startTestServer.call(this, {
            matching: {
              extractSceneActorsFromFilepath: false,
              extractSceneLabelsFromFilepath: false,
              extractSceneMoviesFromFilepath: false,
              extractSceneStudiosFromFilepath: false,
            },
          });

          const actor = new Actor("dummy actor");
          await actorCollection.upsert(actor._id, actor);

          let errored = false;
          let scene;

          try {
            scene = await Scene.onImport(videoPath, true);
          } catch (err) {
            errored = true;
          }

          expect(errored).to.be.false;
          expect(scene).to.not.be.null;

          const sceneActors = await Scene.getActors(scene);
          expect(sceneActors).to.have.lengthOf(0);
        });

        it.only("does run actor extraction", async function () {
          await startTestServer.call(this, {
            matching: {
              extractSceneActorsFromFilepath: true,
              extractSceneLabelsFromFilepath: false,
              extractSceneMoviesFromFilepath: false,
              extractSceneStudiosFromFilepath: false,
            },
          });

          const actor = new Actor("dummy actor");
          await actorCollection.upsert(actor._id, actor);

          let errored = false;
          let scene;

          try {
            scene = await Scene.onImport(videoPath, true);
          } catch (err) {
            errored = true;
          }

          expect(errored).to.be.false;
          expect(scene).to.not.be.null;

          const sceneActors = await Scene.getActors(scene);
          expect(sceneActors).to.have.lengthOf(1);
        });
      });
    });
  });
});
