//import { movieCollection } from "../../../database";
// import { IMovieSearchQuery, searchMovies } from "../../../search/movie";
import Movie from "../../../types/movie";
//import * as logger from "../../../utils/logger";

export async function getMovies(
  _: unknown
  //{ query, seed }: { query: Partial<IMovieSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: Movie[];
    }
  | undefined
> {
  /* try {
    const timeNow = +new Date();
    const result = await searchMovies(query, seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
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
  } */
  return {
    numItems: 0,
    numPages: 0,
    items: [],
  };
}
