import asyncPool from "tiny-async-pool";

import Image from "../types/image";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { getPage, getPageSize, ISearchResults } from "./common";
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
  studioName: string | null;
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
  if (!images.length) return 0;
  let indexedImageCount = 0;
  const slices = getSlices(2500)(images);

  await asyncPool(4, slices, async (slice) => {
    const docs = [] as IImageSearchDoc[];
    await asyncPool(16, slice, async (image) => {
      if (!isBlacklisted(image.name)) docs.push(await createImageSearchDoc(image));
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

  return {
    id: image._id,
    addedOn: image.addedOn,
    name: image.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labelNames: labels.map((l) => [l.name]).flat(),
    rating: image.rating || 0,
    bookmark: image.bookmark,
    favorite: image.favorite,
    scene: image.scene,
    sceneName: null, // TODO:
    studioName: null, // TODO:
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
  shuffleSeed = "default"
): Promise<ISearchResults> {
  logger.log(`Searching images for '${options.query || "<no query>"}'...`);

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
            fields: ["name", "actorNames^1.5", "labelNames"], // TODO: scenename, studioname
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

  const studios = () => {
    if (options.studios && options.studios.length) {
      return [
        {
          query_string: {
            query: `(${options.studios.map((name) => `studios:${name}`).join(" OR ")})`,
          },
        },
      ];
    }
    return [];
  };

  const scene = () => {
    if (options.scenes && options.scenes.length) {
      return [
        {
          query_string: {
            query: `(${options.scenes.map((name) => `scene:${name}`).join(" OR ")})`,
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

  const result = await getClient().search<IImageSearchDoc>({
    index: indexMap.images,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(),
      track_total_hits: true,
      query: {
        bool: {
          must: isShuffle ? shuffle() : query().filter(Boolean),
          filter: [
            ...actorFilter(),
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
            ...studios(),
            ...scene(),
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
