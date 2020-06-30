import * as logger from "../../../logger";
import { searchMovies } from "../../../search/movie";
import { movieCollection } from "../../../database";

export async function getMovies(
  _,
  { query, seed }: { query?: string; seed?: string }
) {
  try {
    const timeNow = +new Date();
    const result = await searchMovies(query || "", seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${
        (Date.now() - timeNow) / 1000
      }s`
    );

    const movies = await movieCollection.getBulk(result.items);

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return {
      numItems: result.max_items,
      numPages: result.num_pages,
      items: movies.filter(Boolean),
    };
  } catch (error) {
    logger.error(error);
  }
}
