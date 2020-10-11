import "mocha";

import { expect } from "chai";
import path from "path";

import { onMovieCreate } from "../../../src/plugins/events/movie";
import Movie from "../../../src/types/movie";
import { cleanupPluginsConfig, CONFIG_FIXTURES, initPluginsConfig } from "../initPluginFixtures";

describe("plugins", () => {
  describe("events", () => {
    describe("movie", () => {
      CONFIG_FIXTURES.forEach((configFixture) => {
        const moviePluginFixture = require(path.resolve(
          configFixture.config.plugins.register[
            `movie_plugin_fixture_${configFixture.name === "TS" ? "ts" : "js"}`
          ].path
        ));

        before(async () => {
          await initPluginsConfig(configFixture.path, configFixture.config);
        });

        after(async () => {
          await cleanupPluginsConfig();
        });

        ["movieCreated"].forEach((event: string) => {
          it(`config ${configFixture.name}: event '${event}': runs fixture plugin, changes properties`, async () => {
            const initialName = "initial movie name";
            let movie = new Movie(initialName);

            expect(movie.name).to.equal(initialName);

            expect(movie.name).to.not.equal(moviePluginFixture.result.name);
            expect(movie.description).to.not.equal(moviePluginFixture.result.description);
            expect(movie.releaseDate).to.not.equal(moviePluginFixture.result.releaseDate);
            expect(movie.rating).to.not.equal(moviePluginFixture.result.rating);
            expect(movie.favorite).to.not.equal(moviePluginFixture.result.favorite);
            expect(movie.bookmark).to.not.equal(moviePluginFixture.result.bookmark);

            movie = await onMovieCreate(movie, event);

            expect(movie.name).to.equal(moviePluginFixture.result.name);
            expect(movie.description).to.equal(moviePluginFixture.result.description);
            expect(movie.releaseDate).to.equal(moviePluginFixture.result.releaseDate);
            expect(movie.rating).to.equal(moviePluginFixture.result.rating);
            expect(movie.favorite).to.equal(moviePluginFixture.result.favorite);
            expect(movie.bookmark).to.equal(moviePluginFixture.result.bookmark);
          });
        });
      });
    });
  });
});
