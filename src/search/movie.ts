import Movie from "../types/movie";
import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import {
  buildPagination,
  filterActors,
  filterBookmark,
  filterDuration,
  filterExclude,
  filterFavorites,
  filterInclude,
  filterRating,
  filterStudios,
} from "./common";
import { Gianna } from "./internal";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export let index!: Gianna.Index<IMovieSearchDoc>;

const FIELDS = ["name", "actorNames", "labelNames", "studioName"];

export interface IMovieSearchDoc {
  _id: string;
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
    _id: movie._id,
    addedOn: movie.addedOn,
    name: movie.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
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
  return addSearchDocs(index, docs);
}

export async function updateMovies(movies: Movie[]): Promise<void> {
  return index.update(await mapAsync(movies, createMovieSearchDoc));
}

export async function indexMovies(movies: Movie[], progressCb?: ProgressCallback): Promise<number> {
  return indexItems(movies, createMovieSearchDoc, addMovieSearchDocs, progressCb);
}

export async function buildMovieIndex(): Promise<Gianna.Index<IMovieSearchDoc>> {
  index = await Gianna.createIndex("movies", FIELDS);
  await buildIndex("movies", Movie.getAll, indexMovies);
  return index;
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
): Promise<Gianna.ISearchResults> {
  logger.log(`Searching movies for '${options.query}'...`);

  let sort = undefined as Gianna.ISortOptions | undefined;
  const filter = {
    type: "AND",
    children: [],
  } as Gianna.IFilterTreeGrouping;

  filterDuration(filter, options);
  filterFavorites(filter, options);
  filterBookmark(filter, options);
  filterRating(filter, options);
  filterInclude(filter, options);
  filterExclude(filter, options);
  filterActors(filter, options);
  filterStudios(filter, options);

  if (!options.query && options.sortBy === "relevance") {
    logger.log("No search query, defaulting to sortBy addedOn");
    options.sortBy = "addedOn";
    options.sortDir = "desc";
  }

  if (options.sortBy) {
    if (options.sortBy === "$shuffle") {
      sort = {
        // eslint-disable-next-line camelcase
        sort_by: "$shuffle",
        // eslint-disable-next-line camelcase
        sort_asc: false,
        // eslint-disable-next-line camelcase
        sort_type: shuffleSeed,
      };
    } else {
      // eslint-disable-next-line
      const sortType: string = {
        addedOn: "number",
        name: "string",
        rating: "number",
        bookmark: "number",
        releaseDate: "number",
        duration: "number",
      }[options.sortBy];
      sort = {
        // eslint-disable-next-line camelcase
        sort_by: options.sortBy,
        // eslint-disable-next-line camelcase
        sort_asc: options.sortDir === "asc",
        // eslint-disable-next-line camelcase
        sort_type: sortType,
      };
    }
  }

  return index.search({
    query: options.query,
    sort,
    filter,
    ...buildPagination(options.take, options.skip, options.page),
  });
}
