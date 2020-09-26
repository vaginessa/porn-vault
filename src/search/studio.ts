import ora from "ora";

import argv from "../args";
import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { filterBookmark, filterExclude, filterFavorites, filterInclude } from "./common";
import { Gianna } from "./internal";

const PAGE_SIZE = 24;

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
  logger.log(`Indexing ${docs.length} items...`);
  const timeNow = +new Date();
  const res = await index.index(docs);
  logger.log(`Gianna indexing done in ${(Date.now() - timeNow) / 1000}s`);
  return res;
}

export async function updateStudios(studios: Studio[]): Promise<void> {
  return index.update(await mapAsync(studios, createStudioSearchDoc));
}

export async function indexStudios(studios: Studio[]): Promise<number> {
  let docs = [] as IStudioSearchDoc[];
  let numItems = 0;
  for (const studio of studios) {
    docs.push(await createStudioSearchDoc(studio));

    if (docs.length === (argv["index-slice-size"] || 5000)) {
      await addStudioSearchDocs(docs);
      numItems += docs.length;
      docs = [];
    }
  }
  if (docs.length) {
    await addStudioSearchDocs(docs);
    numItems += docs.length;
  }
  docs = [];
  return numItems;
}

export async function buildStudioIndex(): Promise<Gianna.Index<IStudioSearchDoc>> {
  index = await Gianna.createIndex("studios", FIELDS);

  const timeNow = +new Date();
  const loader = ora("Building studio index...").start();

  const res = await indexStudios(await Studio.getAll());

  loader.succeed(`Build done in ${(Date.now() - timeNow) / 1000}s.`);
  logger.log(`Index size: ${res} items`);

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
    skip: options.skip || (options.page || 0) * 24,
    take: options.take || PAGE_SIZE,
    sort,
    filter,
  });
}
