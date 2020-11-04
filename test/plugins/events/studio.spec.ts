import "mocha";

import { expect } from "chai";
import { existsSync, readFileSync, unlinkSync } from "fs";
import path from "path";

import { MAX_STUDIO_RECURSIVE_CALLS, onStudioCreate } from "../../../src/plugins/events/studio";
import Studio from "../../../src/types/studio";
import { startTestServer, stopTestServer } from "../../testServer";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";
import { before } from "mocha";

describe("plugins", () => {
  after(async () => {
    await cleanupPluginsConfig();
  });

  describe("events", () => {
    describe("studio", () => {
      describe("basic run", () => {
        CONFIG_FIXTURES.forEach((configFixture) => {
          before(async () => {
            await initPluginsConfig(configFixture);
          });

          ["studioCreated", "studioCustom"].forEach((ev: string) => {
            const event: "studioCreated" | "studioCustom" = ev as any;
            const pluginNames = configFixture.config.plugins.events[event];
            expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

            const scenePluginFixture = require(path.resolve(
              configFixture.config.plugins.register[pluginNames[0]].path
            ));

            it(`event '${event}': runs fixture plugin, changes properties`, async () => {
              const initialName = "initial studio name";
              let studio = new Studio(initialName);

              expect(studio.name).to.equal(initialName);

              expect(studio.name).to.not.equal(scenePluginFixture.result.name);
              expect(studio.description).to.not.equal(scenePluginFixture.result.description);
              expect(studio.favorite).to.not.equal(scenePluginFixture.result.favorite);
              expect(studio.bookmark).to.not.equal(scenePluginFixture.result.bookmark);
              expect(studio.aliases).to.not.deep.equal(scenePluginFixture.result.aliases);

              studio = await onStudioCreate(studio, [], event);

              expect(studio.name).to.equal(scenePluginFixture.result.name);
              expect(studio.description).to.equal(scenePluginFixture.result.description);
              expect(studio.favorite).to.equal(scenePluginFixture.result.favorite);
              expect(studio.bookmark).to.equal(scenePluginFixture.result.bookmark);
              expect(studio.aliases).to.deep.equal(scenePluginFixture.result.aliases);
            });
          });
        });
      });

      describe("recursive checks", () => {
        const callCountPath = "./test/plugins/fixtures/studio/call_count";

        const getCallCount = () => {
          if (existsSync(callCountPath)) {
            return parseInt(readFileSync(callCountPath, "utf-8"));
          }
          return 0;
        };

        function cleanup() {
          if (existsSync(callCountPath)) {
            unlinkSync(callCountPath);
          }
        }

        beforeEach(() => {
          cleanup();
        });

        afterEach(() => {
          cleanup();
          stopTestServer();
        });

        ["studioCreated", "studioCustom"].forEach((ev: string) => {
          const event: "studioCreated" | "studioCustom" = ev as any;
          it(`event '${event}': does not create parent when !plugins.createMissingStudios`, async function () {
            expect(getCallCount()).to.equal(0);

            await startTestServer.call(this, {
              plugins: {
                events: {
                  actorCreated: [],
                  actorCustom: [],
                  sceneCreated: [],
                  sceneCustom: [],
                  movieCreated: [],
                  studioCreated: ["studio_plugin_recursive"],
                  studioCustom: ["studio_plugin_recursive"],
                },
                register: {
                  studio_plugin_recursive: {
                    path: "./test/plugins/fixtures/studio/recursive.fixture.js",
                  },
                },
                createMissingStudios: false,
              },
            });

            let studio = new Studio("studio_1");

            await onStudioCreate(studio, [], event);
            expect(getCallCount()).to.equal(1);
          });

          it(`event '${event}': creates parents, does not call recursively more than ${
            1 + MAX_STUDIO_RECURSIVE_CALLS
          }`, async function () {
            expect(getCallCount()).to.equal(0);

            await startTestServer.call(this, {
              plugins: {
                events: {
                  actorCreated: [],
                  actorCustom: [],
                  sceneCreated: [],
                  sceneCustom: [],
                  movieCreated: [],
                  studioCreated: ["studio_plugin_recursive"],
                  studioCustom: ["studio_plugin_recursive"],
                },
                register: {
                  studio_plugin_recursive: {
                    path: "./test/plugins/fixtures/studio/recursive.fixture.js",
                  },
                },
                createMissingStudios: true,
              },
            });

            let studio = new Studio("studio_1");

            await onStudioCreate(studio, [], event);
            // The total call count should be the initial call + recursive calls
            expect(getCallCount()).to.equal(1 + MAX_STUDIO_RECURSIVE_CALLS);
          });
        });
      });
    });
  });
});
