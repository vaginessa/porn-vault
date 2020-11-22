import Scene from "../types/scene";
import Studio from "../types/studio";
import SceneView from "../types/watch";
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

export let index!: Gianna.Index<ISceneSearchDoc>;

export interface ISceneSearchDoc {
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
    _id: scene._id,
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

const FIELDS = ["name", "labels", "actors", "studioName", "actorNames", "labelNames"];

async function addSceneSearchDocs(docs: ISceneSearchDoc[]) {
  return addSearchDocs(index, docs);
}

export async function updateScenes(scenes: Scene[]): Promise<void> {
  return index.update(await mapAsync(scenes, createSceneSearchDoc));
}

export async function indexScenes(scenes: Scene[], progressCb?: ProgressCallback): Promise<number> {
  return indexItems(scenes, createSceneSearchDoc, addSceneSearchDocs, progressCb);
}

export interface ISceneSearchQuery {
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
): Promise<Gianna.ISearchResults> {
  logger.log(`Searching scenes for '${options.query}'...`);

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
  });
}

export async function buildSceneIndex(): Promise<Gianna.Index<ISceneSearchDoc>> {
  index = await Gianna.createIndex("scenes", FIELDS);
  await buildIndex("scenes", Scene.getAll, indexScenes);
  return index;
}
