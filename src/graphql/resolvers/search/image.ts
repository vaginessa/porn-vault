import { imageCollection } from "../../../database";
import { IImageSearchQuery, searchImages } from "../../../search/image";
import Image from "../../../types/image";
import * as logger from "../../../utils/logger";

export async function getImages(
  _: unknown,
  { query, seed }: { query: Partial<IImageSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: Image[];
    }
  | undefined
> {
  const timeNow = +new Date();

  const result = await searchImages(query, seed);
  logger.log(`Search results: ${result.total} hits found in ${(Date.now() - timeNow) / 1000}s`);

  const scenes = await imageCollection.getBulk(result.items);
  logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

  return {
    numItems: result.total,
    numPages: result.numPages,
    items: scenes.filter(Boolean),
  };
}
