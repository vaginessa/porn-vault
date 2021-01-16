import { logger } from "../utils/logger";

/**
 *
 * @param search - paginated search for the concerned items
 * @param getBulk - retrieves bulk items
 * @param itemCb - the iteration callback function. Return a truthy value to stop the iteration. The return value will be the
 * item passed to the callback.
 * @param name - name of what is being iterated for logs
 */
export async function iterate<T extends { _id: string }>(
  search: ({ page: number }, _: string, extraFilter: unknown[]) => Promise<{ items: string[] }>,
  getBulk: (ids: string[]) => Promise<T[]>,
  itemCb: (item: T) => void | unknown | Promise<void> | Promise<unknown>,
  name: string,
  extraFilter: unknown[] = []
): Promise<T | void> {
  logger.verbose(`Iterating ${name}s`);
  let more = true;
  let numScenes = 0;

  for (let page = 0; more; page++) {
    logger.debug(`Getting ${name} page ${page}`);
    const { items: indexedItems } = await search(
      {
        page,
      },
      "",
      extraFilter
    );

    if (indexedItems.length) {
      numScenes += indexedItems.length;
      const items = await getBulk(indexedItems);
      for (const item of items) {
        logger.silly(`Running callback for ${name} "${item._id}"`);
        const res = await itemCb(item);
        if (res) {
          logger.silly(`Callback returned truthy value, will return that item`);
          return item;
        }
      }
    } else {
      logger.debug("No more pages");
      more = false;
    }
  }

  logger.verbose(`Iterated ${numScenes} ${name}s`);
}
