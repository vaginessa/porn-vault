import { logger } from "../utils/logger";

export async function iterate<T extends { _id: string }>(
  name: string,
  search: ({ page: number }) => Promise<{ items: string[] }>,
  getBulk: (ids: string[]) => Promise<T[]>,
  itemCb: (item: T) => Promise<void> | void
): Promise<void> {
  logger.verbose(`Iterating ${name}s`);
  let more = true;
  let numScenes = 0;

  for (let page = 0; more; page++) {
    logger.debug(`Getting ${name} page ${page}`);
    const { items: indexedItems } = await search({
      page,
    });

    if (indexedItems.length) {
      numScenes += indexedItems.length;
      const items = await getBulk(indexedItems);
      for (const item of items) {
        logger.silly(`Running callback for ${name} "${item._id}"`);
        await itemCb(item);
      }
    } else {
      logger.debug("No more pages");
      more = false;
    }
  }

  logger.verbose(`Iterated ${numScenes} ${name}s`);
}
