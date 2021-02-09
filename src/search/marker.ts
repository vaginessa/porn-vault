import Marker from "../types/marker";
import Scene from "../types/scene";
import { mapAsync } from "../utils/async";
import { logger } from "../utils/logger";
import {
  bookmark,
  excludeFilter,
  favorite,
  getActorNames,
  getCount,
  getPage,
  getPageSize,
  includeFilter,
  ISearchResults,
  normalizeQuery,
  ratingFilter,
  searchQuery,
  shuffle,
  shuffleSwitch,
  sort,
} from "./common";
import { getClient, indexMap } from "./index";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

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
  custom: Record<string, boolean | string | number | string[] | null>;
  numActors: number;
}

export async function createMarkerSearchDoc(marker: Marker): Promise<IMarkerSearchDoc> {
  const labels = await Marker.getLabels(marker);
  const scene = (await Scene.getById(marker.scene))!;
  const actors = await Scene.getActors(scene);

  return {
    id: marker._id,
    addedOn: marker.addedOn,
    name: normalizeQuery(marker.name),
    actors: actors.map((a) => a._id),
    actorNames: [...new Set(actors.map(getActorNames).flat())],
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => l.name),
    scene: scene ? scene._id : "",
    sceneName: scene ? scene.name : "",
    rating: marker.rating,
    bookmark: marker.bookmark,
    favorite: marker.favorite,
    custom: marker.customFields,
    numActors: actors.length,
  };
}

async function addMarkerSearchDocs(docs: IMarkerSearchDoc[]): Promise<void> {
  return addSearchDocs(indexMap.markers, docs);
}

export async function removeMarker(markerId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.markers,
    id: markerId,
    type: "_doc",
  });
}

export async function removeMarkers(markerIds: string[]): Promise<void> {
  await mapAsync(markerIds, removeMarker);
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
  shuffleSeed = "default",
  extraFilter: unknown[] = []
): Promise<ISearchResults> {
  logger.verbose(`Searching markers for '${options.query?.trim() || "<no query>"}'...`);

  const count = await getCount(indexMap.markers);
  if (count === 0) {
    logger.debug(`No items in ES, returning 0`);
    return {
      items: [],
      numPages: 0,
      total: 0,
    };
  }

  const query = searchQuery(options.query, ["name", "actorNames^1.5", "labelNames", "sceneName"]);
  const _shuffle = shuffle(shuffleSeed, query, options.sortBy);

  const result = await getClient().search<IMarkerSearchDoc>({
    index: indexMap.markers,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(options.sortBy, options.sortDir, options.query),
      track_total_hits: true,
      query: {
        bool: {
          ...shuffleSwitch(query, _shuffle),
          filter: [
            ...ratingFilter(options.rating),
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const total: number = result.hits.total.value;

  return {
    items: result.hits.hits.map((doc) => doc._source.id),
    total,
    numPages: Math.ceil(total / getPageSize(options.take)),
  };
}
