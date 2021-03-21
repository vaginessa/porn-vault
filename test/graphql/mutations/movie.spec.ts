import { expect } from "chai";

import movieMutations from "../../../src/graphql/mutations/movie";
import { getMovies } from "../../../src/graphql/resolvers/search/movie";
import { indexMovies } from "../../../src/search/movie";
import Movie from "../../../src/types/movie";
import { startTestServer, stopTestServer } from "../../testServer";
import { movieCollection } from "./../../../src/database";

describe("graphql", () => {
  describe("mutations", () => {
    describe("movie", () => {
      afterEach(() => {
        stopTestServer();
      });

      describe("removeMovie", () => {
        it("removes the movie", async function () {
          await startTestServer.call(this);
          const movie = new Movie("test movie");
          await movieCollection.upsert(movie._id, movie);
          await indexMovies([movie]);

          expect((await getMovies(null, { query: {}, seed: "" }))?.numItems).to.equal(1);
          expect(await Movie.getById(movie._id)).to.not.be.null;

          const removeRes = await movieMutations.removeMovies(null, { ids: [movie._id] });

          expect(removeRes).to.be.true;

          // Wait for index update to take effect
          await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

          expect((await getMovies(null, { query: {}, seed: "" }))?.numItems).to.equal(0);
          expect(await Movie.getById(movie._id)).to.be.null;
        });
      });
    });
  });
});
