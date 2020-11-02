import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import {
  buildPagination,
  filterBookmark,
  filterExclude,
  filterFavorites,
  filterInclude,
} from "./common";
import { Gianna } from "./internal";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export let index!: Gianna.Index<IStudioSearchDoc>;

const FIELDS = ["name", "labelNames"];

export interface IStudioSearchDoc {
  _id: string;
  addedOn: number;
  name: string;
  labels: string[];
  labelNames: string[];
  bookmark: number | null;
  favorite: boolean;
  // rating: number;
  numScenes: number;
}

export async function createStudioSearchDoc(studio: Studio): Promise<IStudioSearchDoc> {
  const labels = await Studio.getLabels(studio);
  // const actors = await Studio.getActors(studio);

  return {
    _id: studio._id,
    addedOn: studio.addedOn,
    name: studio.name,
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
    // rating: studio.rating,
    bookmark: studio.bookmark,
    favorite: studio.favorite,
    numScenes: (await Studio.getScenes(studio)).length,
  };
}

async function addStudioSearchDocs(docs: IStudioSearchDoc[]) {
  return addSearchDocs(index, docs);
}

export async function updateStudios(studios: Studio[]): Promise<void> {
  return index.update(await mapAsync(studios, createStudioSearchDoc));
}

export async function indexStudios(
  studios: Studio[],
  progressCb?: ProgressCallback
): Promise<number> {
  return indexItems(studios, createStudioSearchDoc, addStudioSearchDocs, progressCb);
}

export async function buildStudioIndex(): Promise<Gianna.Index<IStudioSearchDoc>> {
  index = await Gianna.createIndex("studios", FIELDS);
  await buildIndex("studios", Studio.getAll, indexStudios);
  return index;
}

export interface IStudioSearchQuery {
  query: string;
  favorite?: boolean;
  bookmark?: boolean;
  // rating: number;
  include?: string[];
  exclude?: string[];
  sortBy?: string;
  sortDir?: string;
  skip?: number;
  take?: number;
  page?: number;
}

export async function searchStudios(
  options: Partial<IStudioSearchQuery>,
  shuffleSeed = "default"
): Promise<Gianna.ISearchResults> {
  logger.log(`Searching studios for '${options.query}'...`);

  let sort = undefined as Gianna.ISortOptions | undefined;
  const filter = {
    type: "AND",
    children: [],
  } as Gianna.IFilterTreeGrouping;

  filterFavorites(filter, options);
  filterBookmark(filter, options);
  // filterRating(filter, options);
  filterInclude(filter, options);
  filterExclude(filter, options);

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
        // rating: "number",
        bookmark: "number",
        numScenes: "number",
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
