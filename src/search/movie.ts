import Movie from "../types/movie";
import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { getPage, getPageSize, ISearchResults } from "./common";
import { getClient, indexMap } from "./index";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export interface IMovieSearchDoc {
  id: string;
  addedOn: number;
  name: string;
  actors: string[];
  labels: string[];
  actorNames: string[];
  labelNames: string[];
  rating: number;
  bookmark: number | null;
  favorite: boolean;
  releaseDate: number | null;
  duration: number | null;
  studio: string | null;
  studioName: string | null;
  numScenes: number;
}

export async function createMovieSearchDoc(movie: Movie): Promise<IMovieSearchDoc> {
  const labels = await Movie.getLabels(movie);
  const actors = await Movie.getActors(movie);
  const studio = movie.studio ? await Studio.getById(movie.studio) : null;
  const scenes = await Movie.getScenes(movie);

  return {
    id: movie._id,
    addedOn: movie.addedOn,
    name: movie.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labelNames: labels.map((l) => [l.name]).flat(),
    studio: studio ? studio._id : null,
    studioName: studio ? studio.name : null,
    rating: await Movie.getRating(movie),
    bookmark: movie.bookmark,
    favorite: movie.favorite,
    duration: await Movie.calculateDuration(movie),
    releaseDate: movie.releaseDate,
    numScenes: scenes.length,
  };
}

async function addMovieSearchDocs(docs: IMovieSearchDoc[]): Promise<void> {
  return addSearchDocs(indexMap.movies, docs);
}

export async function removeMovie(movieId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.images,
    id: movieId,
    type: "_doc",
  });
}

export async function removeMovies(movieIds: string[]): Promise<void> {
  await mapAsync(movieIds, removeMovie);
}

export async function indexMovies(movies: Movie[], progressCb?: ProgressCallback): Promise<number> {
  return indexItems(movies, createMovieSearchDoc, addMovieSearchDocs, progressCb);
}

export async function buildMovieIndex(): Promise<void> {
  await buildIndex(indexMap.movies, Movie.getAll, indexMovies);
}

export interface IMovieSearchQuery {
  query: string;
  favorite?: boolean;
  bookmark?: boolean;
  rating: number;
  include?: string[];
  exclude?: string[];
  studios?: string[];
  actors?: string[];
  sortBy?: string;
  sortDir?: string;
  skip?: number;
  take?: number;
  page?: number;
  durationMin?: number;
  durationMax?: number;
}

export async function searchMovies(
  options: Partial<IMovieSearchQuery>,
  shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching movies for '${options.query || "<no query>"}'...`);

  const actorFilter = () => {
    if (options.actors && options.actors.length) {
      return [
        {
          query_string: {
            query: `(${options.actors.map((name) => `actors:${name}`).join(" AND ")})`,
          },
        },
      ];
    }
    return [];
  };

  const includeFilter = () => {
    if (options.include && options.include.length) {
      return [
        {
          query_string: {
            query: `(${options.include.map((name) => `labels:${name}`).join(" AND ")})`,
          },
        },
      ];
    }
    return [];
  };

  const excludeFilter = () => {
    if (options.exclude && options.exclude.length) {
      return [
        {
          query_string: {
            query: `(${options.exclude.map((name) => `-labels:${name}`).join(" AND ")})`,
          },
        },
      ];
    }
    return [];
  };

  const query = () => {
    if (options.query && options.query.length) {
      return [
        {
          multi_match: {
            query: options.query || "",
            fields: ["name", "actorNames^1.5", "labelNames", "studioName"],
            fuzziness: "AUTO",
          },
        },
      ];
    }
    return [];
  };

  const favorite = () => {
    if (options.favorite) {
      return [
        {
          term: { favorite: true },
        },
      ];
    }
    return [];
  };

  const bookmark = () => {
    if (options.bookmark) {
      return [
        {
          exists: {
            field: "bookmark",
          },
        },
      ];
    }
    return [];
  };

  const studio = () => {
    if (options.studios && options.studios.length) {
      return [
        {
          query_string: {
            query: `(${options.studios.map((name) => `actors:${name}`).join(" OR ")})`,
          },
        },
      ];
    }
    return [];
  };

  const isShuffle = options.sortBy === "$shuffle";

  const sort = () => {
    if (isShuffle) {
      return {};
    }
    if (options.sortBy === "relevance" && !options.query) {
      return {
        sort: { addedOn: "desc" },
      };
    }
    if (options.sortBy && options.sortBy !== "relevance") {
      return {
        sort: {
          [options.sortBy]: options.sortDir || "desc",
        },
      };
    }
    return {};
  };

  const shuffle = () => {
    if (isShuffle) {
      return {
        function_score: {
          query: { match_all: {} },
          random_score: {
            seed: shuffleSeed,
          },
        },
      };
    }
    return {};
  };

  const result = await getClient().search<IMovieSearchDoc>({
    index: indexMap.movies,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(),
      track_total_hits: true,
      query: {
        bool: {
          must: isShuffle ? shuffle() : query().filter(Boolean),
          filter: [
            ...actorFilter(),
            ...includeFilter(),
            ...excludeFilter(),
            {
              range: {
                rating: {
                  gte: options.rating || 0,
                },
              },
            },
            {
              range: {
                duration: {
                  lte: options.durationMax || 99999999,
                  gte: options.durationMin || 0,
                },
              },
            },
            ...bookmark(),
            ...favorite(),
            ...studio(),
          ],
        },
      },
    },
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const total: number = result.hits.total.value;

  return {
    items: result.hits.hits.map((doc) => doc._source.id),
    total,
    numPages: Math.ceil(total / getPageSize(options.take)),
  };
}
