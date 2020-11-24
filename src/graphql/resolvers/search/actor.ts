//import { actorCollection } from "../../../database";
//import { IActorSearchQuery, searchActors } from "../../../search/actor";
import Actor from "../../../types/actor";
//import * as logger from "../../../utils/logger";

export async function getUnwatchedActors(
  _: unknown,
  { take, skip, seed }: { skip?: number; take?: number; seed?: string }
): Promise<Actor[] | undefined> {
  return [];
  /*  try {
    const timeNow = +new Date();
    const result = await searchActors(
      {
        query: "",
        take: take || 4,
        skip: skip || 0,
      },
      seed,
      (tree) => {
        tree.children.push({
          condition: {
            operation: "=",
            property: "numViews",
            type: "number",
            value: 0,
          },
        });
      }
    );

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
    );

    const actors = await actorCollection.getBulk(result.items);

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return actors.filter(Boolean);
  } catch (error) {
    logger.error(error);
  } */
}

export async function getActors(
  _: unknown
  // { query, seed }: { query: Partial<IActorSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: Actor[];
    }
  | undefined
> {
  return {
    numItems: 0,
    numPages: 0,
    items: [],
  };
  /* try {
    const timeNow = +new Date();
    const result = await searchActors(query, seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
    );

    const actors = await actorCollection.getBulk(result.items);

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return {
      numItems: result.max_items,
      numPages: result.num_pages,
      items: actors.filter(Boolean),
    };
  } catch (error) {
    logger.error(error);
  } */
}
