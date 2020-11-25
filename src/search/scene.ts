import Scene from "../types/scene";
import Studio from "../types/studio";
import SceneView from "../types/watch";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { getPage, getPageSize, ISearchResults } from "./common";
import { getClient, indexMap } from "./index";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export interface ISceneSearchDoc {
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
  numViews: number;
  releaseDate: number | null;
  duration: number | null;
  studio: string | null;
  studioName: string | null;
  resolution: number | null;
  size: number | null;
  score: number;
}

async function createSceneSearchDoc(scene: Scene): Promise<ISceneSearchDoc> {
  const labels = await Scene.getLabels(scene);
  const actors = await Scene.getActors(scene);
  const numViews = await SceneView.getCount(scene._id);

  return {
    id: scene._id,
    addedOn: scene.addedOn,
    name: scene.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labelNames: labels.map((l) => [l.name]).flat(),
    rating: scene.rating,
    bookmark: scene.bookmark,
    favorite: scene.favorite,
    numViews,
    duration: scene.meta.duration,
    releaseDate: scene.releaseDate,
    studio: scene.studio,
    resolution: scene.meta.dimensions ? scene.meta.dimensions.height : 0,
    size: scene.meta.size,
    studioName: scene.studio ? ((await Studio.getById(scene.studio)) || { name: null }).name : null,
    score: Scene.calculateScore(scene, numViews),
  };
}

export async function buildSceneIndex(): Promise<void> {
  await buildIndex(indexMap.scenes, Scene.getAll, indexScenes);
}

async function addSceneSearchDocs(docs: ISceneSearchDoc[]) {
  return addSearchDocs(indexMap.scenes, docs);
}

export async function indexScenes(scenes: Scene[], progressCb?: ProgressCallback): Promise<number> {
  return indexItems(scenes, createSceneSearchDoc, addSceneSearchDocs, progressCb);
}

export async function removeScene(sceneId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.scenes,
    id: sceneId,
    type: "_doc",
  });
}

export async function removeScenes(sceneIds: string[]): Promise<void> {
  await mapAsync(sceneIds, removeScene);
}

export interface ISceneSearchQuery {
  id: string;
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

export async function searchScenes(
  options: Partial<ISceneSearchQuery>,
  shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching scenes for '${options.query || "<no query>"}'...`);

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

  const result = await getClient().search<ISceneSearchDoc>({
    index: indexMap.scenes,
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
