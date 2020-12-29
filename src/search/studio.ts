import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import {
  bookmark,
  excludeFilter,
  favorite,
  getCount,
  getPage,
  getPageSize,
  includeFilter,
  ISearchResults,
  searchQuery,
  shuffle,
  sort,
} from "./common";
import { getClient, indexMap } from "./index";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export interface IStudioSearchDoc {
  id: string;
  addedOn: number;
  name: string;
  labels: string[];
  labelNames: string[];
  bookmark: number | null;
  favorite: boolean;
  rating: number;
  numScenes: number;
  custom: Record<string, boolean | string | number | string[] | null>;
}

export async function createStudioSearchDoc(studio: Studio): Promise<IStudioSearchDoc> {
  const labels = await Studio.getLabels(studio);
  // const actors = await Studio.getActors(studio);

  return {
    id: studio._id,
    addedOn: studio.addedOn,
    name: studio.name,
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => l.name),
    rating: 0,
    bookmark: studio.bookmark,
    favorite: studio.favorite,
    numScenes: (await Studio.getScenes(studio)).length,
    custom: studio.customFields,
  };
}

async function addStudioSearchDocs(docs: IStudioSearchDoc[]) {
  return addSearchDocs(indexMap.studios, docs);
}

export async function removeStudio(studioId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.studios,
    id: studioId,
    type: "_doc",
  });
}

export async function removeStudios(studioIds: string[]): Promise<void> {
  await mapAsync(studioIds, removeStudio);
}

export async function indexStudios(
  studios: Studio[],
  progressCb?: ProgressCallback
): Promise<number> {
  return indexItems(studios, createStudioSearchDoc, addStudioSearchDocs, progressCb);
}

export async function buildStudioIndex(): Promise<void> {
  await buildIndex(indexMap.studios, Studio.getAll, indexStudios);
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
  shuffleSeed = "default",
  extraFilter: unknown[] = []
): Promise<ISearchResults> {
  logger.log(`Searching studios for '${options.query || "<no query>"}'...`);

  const count = await getCount(indexMap.studios);
  if (count === 0) {
    logger.log(`No items in ES, returning 0`);
    return {
      items: [],
      numPages: 0,
      total: 0,
    };
  }

  const result = await getClient().search<IStudioSearchDoc>({
    index: indexMap.studios,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(options.sortBy, options.sortDir, options.query),
      track_total_hits: true,
      query: {
        bool: {
          must: [
            shuffle(shuffleSeed, options.sortBy),
            ...searchQuery(options.query, ["name^2", "labelNames"]),
          ],
          filter: [
            ...bookmark(options.bookmark),
            ...favorite(options.favorite),

            ...includeFilter(options.include),
            ...excludeFilter(options.exclude),

            ...extraFilter,
          ],
        },
      },
    },
  });
  // @ts-ignore
  const total: number = result.hits.total.value;

  return {
    items: result.hits.hits.map((doc) => doc._source.id),
    total,
    numPages: Math.ceil(total / getPageSize(options.take)),
  };
}
