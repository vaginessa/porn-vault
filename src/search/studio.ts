import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { getPage, getPageSize, ISearchResults } from "./common";
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
  // rating: number;
  numScenes: number;
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
    // rating: studio.rating,
    bookmark: studio.bookmark,
    favorite: studio.favorite,
    numScenes: (await Studio.getScenes(studio)).length,
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
  shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching studios for '${options.query || "<no query>"}'...`);

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
            fields: ["name^2", "labelNames"],
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

  const result = await getClient().search<IStudioSearchDoc>({
    index: indexMap.studios,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(),
      track_total_hits: true,
      query: {
        bool: {
          must: isShuffle ? shuffle() : query().filter(Boolean),
          filter: [...includeFilter(), ...excludeFilter(), ...bookmark(), ...favorite()],
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
