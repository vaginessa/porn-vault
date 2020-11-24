import { getClient, indexMap } from "./index";
import Scene from "../types/scene";
import Studio from "../types/studio";
import SceneView from "../types/watch";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";
import * as logger from "../utils/logger";

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
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
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
  await buildIndex("scenes", Scene.getAll, indexScenes);
}

async function addSceneSearchDocs(docs: ISceneSearchDoc[]) {
  return addSearchDocs(indexMap.scenes, docs);
}

export async function indexScenes(scenes: Scene[], progressCb?: ProgressCallback): Promise<number> {
  return indexItems(scenes, createSceneSearchDoc, addSceneSearchDocs, progressCb);
}

export async function updateScenes(_scenes: Scene[]): Promise<void> {
  // return index.update(await mapAsync(scenes, createSceneSearchDoc));
  // TODO:
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

const PAGE_SIZE = 24;

interface ISearchResults {
  items: string[];
  total: number;
  numPages: number;
}

export async function searchScenes(
  options: Partial<ISceneSearchQuery>,
  _shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching scenes for '${options.query || "<no query>"}'...`);
  /*  const query = () => {
    if (options.query) {
      return {
        multi_match: {
          query: options.query,
          fields: ["name", "actorNames", "labelNames", "studioName"],
        },
      };
    }
    return undefined;
  }; */

  const actorFilter = () => {
    if (options.actors && options.actors.length)
      return {
        query_string: {
          query: `(${options.actors.map((name) => `actors:${name}`).join(" AND ")})`,
        },
      };
    return undefined;
  };

  const labelFilter = () => {
    if (options.include && options.include.length)
      return {
        query_string: {
          query: `(${options.include.map((name) => `labels:${name}`).join(" AND ")})`,
        },
      };
    return undefined;
  };

  // TODO: exclude labels

  const query = () => {
    if (options.query && options.query.length) {
      return [
        {
          fuzzy: { name: options.query || "" },
        },
      ];
    }
    return [];
  };

  const favorite = () => {
    if (options.favorite) {
      return [
        {
          exists: {
            field: "favorite",
          },
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

  const result = await getClient().search<ISceneSearchDoc>({
    index: indexMap.scenes,
    from: Math.max(0, +(options.page || 0) * PAGE_SIZE),
    body: {
      sort: { addedOn: { order: "desc" } },
      query: {
        bool: {
          must: [actorFilter(), labelFilter()].filter(Boolean),
          filter: [
            // TODO: get fuzzy to work
            ...query(),
            {
              // TODO: fix
              range: {
                rating: {
                  lte: options.rating || 0,
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
            // TODO: get favorite to work
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

  // TODO:
  /* logger.log(`Searching scenes for '${options.query}'...`);

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
        numViews: "number",
        releaseDate: "number",
        duration: "number",
        resolution: "number",
        size: "number",
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
  }); */
}
