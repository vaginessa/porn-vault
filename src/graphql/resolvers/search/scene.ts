import { sceneCollection } from "../../../database";
import { ISceneSearchQuery, searchScenes } from "../../../search/scene";
import Scene from "../../../types/scene";
import * as logger from "../../../utils/logger";

export async function getScenes(
  _: unknown,
  { query, seed }: { query: Partial<ISceneSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: Scene[];
    }
  | undefined
> {
  const timeNow = +new Date();

  const result = await searchScenes(query, seed);
  logger.log(`Search results: ${result.total} hits found in ${(Date.now() - timeNow) / 1000}s`);

  const scenes = await sceneCollection.getBulk(result.items);
  logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

  return {
    numItems: result.total,
    numPages: result.numPages,
    items: scenes.filter(Boolean),
  };
}
