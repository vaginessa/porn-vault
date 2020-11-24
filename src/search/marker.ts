import { getClient, indexMap } from "./index";
import Marker from "../types/marker";
import Scene from "../types/scene";
import * as logger from "../utils/logger";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";
import { ISearchResults, PAGE_SIZE } from "./common";

export interface IMarkerSearchDoc {
  id: string;
  addedOn: number;
  name: string;
  actors: string[];
  actorNames: string[];
  labels: string[];
  labelNames: string[];
  rating: number;
  bookmark: number | null;
  favorite: boolean;
  scene: string;
  sceneName: string;
}

export async function createMarkerSearchDoc(marker: Marker): Promise<IMarkerSearchDoc> {
  const labels = await Marker.getLabels(marker);
  const scene = (await Scene.getById(marker.scene))!;
  const actors = await Scene.getActors(scene);

  return {
    id: marker._id,
    addedOn: marker.addedOn,
    name: marker.name,
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => [l.name]).flat(),
    scene: scene ? scene._id : "",
    sceneName: scene ? scene.name : "",
    rating: marker.rating,
    bookmark: marker.bookmark,
    favorite: marker.favorite,
  };
}

async function addMarkerSearchDocs(docs: IMarkerSearchDoc[]): Promise<void> {
  return addSearchDocs(indexMap.markers, docs);
}

export async function updateMarkers(markers: Marker[]): Promise<void> {
  //return index.update(await mapAsync(markers, createMarkerSearchDoc));
  // TODO:
}

export async function indexMarkers(
  markers: Marker[],
  progressCb?: ProgressCallback
): Promise<number> {
  return indexItems(markers, createMarkerSearchDoc, addMarkerSearchDocs, progressCb);
}

export async function buildMarkerIndex(): Promise<void> {
  await buildIndex(indexMap.markers, Marker.getAll, indexMarkers);
}

export interface IMarkerSearchQuery {
  query: string;
  favorite?: boolean;
  bookmark?: boolean;
  rating: number;
  include?: string[];
  exclude?: string[];
  sortBy?: string;
  sortDir?: string;
  skip?: number;
  take?: number;
  page?: number;
}

export async function searchMarkers(
  options: Partial<IMarkerSearchQuery>,
  shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching markers for '${options.query || "<no query>"}'...`);

  const labelFilter = () => {
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

  const query = () => {
    if (options.query && options.query.length) {
      return [
        {
          multi_match: {
            query: options.query || "",
            fields: ["name", "actorNames^1.5", "labelNames", "sceneName"],
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

  const result = await getClient().search<IMarkerSearchDoc>({
    index: indexMap.markers,
    from: Math.max(0, +(options.page || 0) * PAGE_SIZE),
    size: PAGE_SIZE,
    body: {
      ...sort(),
      track_total_hits: true,
      query: {
        bool: {
          must: isShuffle ? shuffle() : query().filter(Boolean),
          filter: [
            ...labelFilter(), // TODO: exclude labels
            {
              range: {
                rating: {
                  gte: options.rating || 0,
                },
              },
            },
            ...bookmark(),
            ...favorite(),
          ],
        },
      },
    },
  });
  // @ts-ignore
  const total = result.hits.total.value;

  return {
    items: result.hits.hits.map((doc) => doc._source.id),
    total,
    numPages: Math.ceil(total / PAGE_SIZE),
  };
}
