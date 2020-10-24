import "mocha";

import { expect } from "chai";
import path from "path";

import { onActorCreate } from "../../../src/plugins/events/actor";
import Actor from "../../../src/types/actor";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";

describe("plugins", () => {
  after(async () => {
    await cleanupPluginsConfig();
  });

  describe("events", () => {
    describe("actor", () => {
      CONFIG_FIXTURES.forEach((configFixture) => {
        before(async () => {
          await initPluginsConfig(configFixture.path, configFixture.config);
        });

        ["actorCreated", "actorCustom"].forEach((event: string) => {
          const pluginNames = configFixture.config.plugins.events[event];
          expect(pluginNames).to.have.lengthOf(1); // This test should only run 1 plugin for the given event

          const actorPluginFixture = require(path.resolve(
            configFixture.config.plugins.register[pluginNames[0]].path
          ));

          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async () => {
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

            actor = await onActorCreate(actor, [], event);

            expect(actor.name).to.equal(actorPluginFixture.result.name);
            expect(actor.bornOn).to.equal(actorPluginFixture.result.bornOn);
            expect(actor.aliases).to.deep.equal(actorPluginFixture.result.aliases);
            expect(actor.rating).to.equal(actorPluginFixture.result.rating);
            expect(actor.favorite).to.equal(actorPluginFixture.result.favorite);
            expect(actor.bookmark).to.equal(actorPluginFixture.result.bookmark);
            expect(actor.nationality).to.equal(actorPluginFixture.result.nationality);
          });
        });
      });
    });
  });
});
