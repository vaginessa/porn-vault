import "mocha";

import { expect } from "chai";

import { onMovieCreate } from "../../../src/plugins/events/movie";
import Movie from "../../../src/types/movie";
import { cleanupPluginsConfig, initPluginsConfig } from "../initPluginFixtures";

const moviePluginFixture = require("../fixtures/movie_plugin.fixture");

describe("plugins", () => {
  before(async () => {
    await initPluginsConfig();
  });

  after(async () => {
    await cleanupPluginsConfig();
  });

  describe("events", () => {
    describe("movie", () => {
      ["movieCreated"].forEach((event: string) => {
        it(`event '${event}': runs fixture plugin, changes properties`, async () => {
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
