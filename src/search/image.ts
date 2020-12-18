import asyncPool from "tiny-async-pool";

import Image from "../types/image";
import Scene from "../types/scene";
import Studio from "../types/studio";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import {
  arrayFilter,
  bookmark,
  excludeFilter,
  favorite,
  getActorNames,
  getCount,
  getPage,
  getPageSize,
  includeFilter,
  ISearchResults,
  ratingFilter,
  shuffle,
  sort,
} from "./common";
import { getClient, indexMap } from "./index";
import { addSearchDocs, buildIndex, ProgressCallback } from "./internal/buildIndex";

export interface IImageSearchDoc {
  id: string;
  name: string;
  addedOn: number;
  actors: string[];
  labels: string[];
  actorNames: string[];
  labelNames: string[];
  bookmark: number | null;
  favorite: boolean;
  rating: number;
  scene: string | null;
  sceneName: string | null;
  studios: string[];
  studioName: string | null;
  custom: Record<string, boolean | string | number | string[] | null>;
  numActors: number;
}

export async function removeImage(imageId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.images,
    id: imageId,
    type: "_doc",
  });
}

export async function removeImages(imageIds: string[]): Promise<void> {
  await mapAsync(imageIds, removeImage);
}

const blacklist = [
  "(alt. thumbnail)",
  "(thumbnail)",
  "(preview)",
  "(front cover)",
  "(back cover)",
  "(spine cover)",
  "(hero image)",
  "(avatar)",
];

export function isBlacklisted(name: string): boolean {
  return blacklist.some((ending) => name.endsWith(ending));
}

export const sliceArray = (size: number) => <T>(
  arr: T[],
  cb: (value: T[], index: number, arr: T[]) => unknown
): void => {
  let index = 0;
  let slice = arr.slice(index, index + size);
  while (slice.length) {
    const result = cb(slice, index, arr);
    if (result) break;
    index += size;
    slice = arr.slice(index, index + size);
  }
};

export const getSlices = (size: number) => <T>(arr: T[]): T[][] => {
  const slices = [] as T[][];
  sliceArray(size)(arr, (slice) => {
    slices.push(slice);
  });
  return slices;
};

export async function indexImages(images: Image[], progressCb?: ProgressCallback): Promise<number> {
  if (!images.length) {
    return 0;
  }
  let indexedImageCount = 0;
  const slices = getSlices(2500)(images);

  await asyncPool(4, slices, async (slice) => {
    const docs = [] as IImageSearchDoc[];
    await asyncPool(16, slice, async (image) => {
      if (!isBlacklisted(image.name)) {
        docs.push(await createImageSearchDoc(image));
      }
    });
    await addImageSearchDocs(docs);
    indexedImageCount += slice.length;
    if (progressCb) {
      progressCb({ percent: (indexedImageCount / images.length) * 100 });
    }
  });

  return indexedImageCount;
}

async function addImageSearchDocs(docs: IImageSearchDoc[]): Promise<void> {
  return addSearchDocs(indexMap.images, docs);
}

export async function buildImageIndex(): Promise<void> {
  await buildIndex(indexMap.images, Image.getAll, indexImages);
}

export async function createImageSearchDoc(image: Image): Promise<IImageSearchDoc> {
  const labels = await Image.getLabels(image);
  const actors = await Image.getActors(image);
  const scene = image.scene ? await Scene.getById(image.scene) : null;

  const studio = image.studio ? await Studio.getById(image.studio) : null;
  const parentStudios = studio ? await Studio.getParents(studio) : [];

  return {
    id: image._id,
    addedOn: image.addedOn,
    name: image.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: [...new Set(actors.map(getActorNames).flat())],
    labelNames: labels.map((l) => l.name),
    rating: image.rating || 0,
    bookmark: image.bookmark,
    favorite: image.favorite,
    scene: image.scene,
    sceneName: scene ? scene.name : null,
    studios: studio ? [studio, ...parentStudios].map((s) => s._id) : [],
    studioName: studio ? studio.name : null,
    custom: image.customFields,
    numActors: actors.length,
  };
}

export interface IImageSearchQuery {
  query: string;
  favorite?: boolean;
  bookmark?: boolean;
  rating: number;
  include?: string[];
  exclude?: string[];
  studios?: string[];
  actors?: string[];
  scenes?: string[];
  sortBy?: string;
  sortDir?: string;
  skip?: number;
  take?: number;
  page?: number;
}

export async function searchImages(
  options: Partial<IImageSearchQuery>,
  shuffleSeed = "default",
  extraFilter: unknown[] = []
): Promise<ISearchResults> {
  logger.log(`Searching images for '${options.query || "<no query>"}'...`);

  const count = await getCount(indexMap.images);
  if (count === 0) {
    logger.log(`No items in ES, returning 0`);
    return {
      items: [],
      numPages: 0,
      total: 0,
    };
  }

  const query = () => {
    if (options.query && options.query.length) {
      return [
        {
          multi_match: {
            query: options.query || "",
            fields: ["name", "actorNames^1.5", "labelNames", "sceneName^0.5", "studioName"],
            fuzziness: "AUTO",
          },
        },
      ];
    }
    return [];
  };

  const result = await getClient().search<IImageSearchDoc>({
    index: indexMap.images,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(options.sortBy, options.sortDir, options.query),
      track_total_hits: true,
      query: {
        bool: {
          must: shuffle(shuffleSeed, options.sortBy, query().filter(Boolean)),
          filter: [
            ratingFilter(options.rating),
            ...bookmark(options.bookmark),
            ...favorite(options.favorite),

            ...includeFilter(options.include),
            ...excludeFilter(options.exclude),

            ...arrayFilter(options.actors, "actors", "AND"),
            ...arrayFilter(options.studios, "studios", "OR"),
            ...arrayFilter(options.scenes, "scene", "OR"),

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
