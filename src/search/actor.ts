import { getClient, indexMap } from "../search";
import Actor from "../types/actor";
import { getNationality } from "../types/countries";
import Scene from "../types/scene";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import { getPage, getPageSize, ISearchResults } from "./common";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export interface IActorSearchDoc {
  id: string;
  addedOn: number;
  name: string;
  aliases: string[];
  labels: string[];
  labelNames: string[];
  rating: number;
  score: number;
  bookmark: number | null;
  favorite: boolean;
  numViews: number;
  bornOn: number | null;
  age: number | null;
  numScenes: number;
  nationalityName: string | null;
  countryCode: string | null;
  custom: string[];
}

export async function createActorSearchDoc(actor: Actor): Promise<IActorSearchDoc> {
  const labels = await Actor.getLabels(actor);

  const numViews = (await Actor.getWatches(actor)).length;
  const numScenes = (await Scene.getByActor(actor._id)).length;

  const nationality = actor.nationality ? getNationality(actor.nationality) : null;

  return {
    id: actor._id,
    addedOn: actor.addedOn,
    name: actor.name,
    aliases: actor.aliases,
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
    score: Actor.calculateScore(actor, numViews, numScenes),
    rating: actor.rating,
    bookmark: actor.bookmark,
    favorite: actor.favorite,
    numViews,
    bornOn: actor.bornOn,
    numScenes,
    age: Actor.getAge(actor),
    nationalityName: nationality ? nationality.nationality : null,
    countryCode: nationality ? nationality.alpha2 : null,
    custom: Object.values(actor.customFields)
      .filter((val) => typeof val !== "number" && typeof val !== "boolean")
      .flat() as string[],
  };
}

export async function removeActor(actorId: string): Promise<void> {
  await getClient().delete({
    index: indexMap.actors,
    id: actorId,
    type: "_doc",
  });
}

export async function removeActors(actorIds: string[]): Promise<void> {
  await mapAsync(actorIds, removeActor);
}

export async function indexActors(actors: Actor[], progressCb?: ProgressCallback): Promise<number> {
  logger.log(`Indexing ${actors.length} actors`);
  return indexItems(actors, createActorSearchDoc, addActorSearchDocs, progressCb);
}

async function addActorSearchDocs(docs: IActorSearchDoc[]): Promise<void> {
  return addSearchDocs(indexMap.actors, docs);
}

export async function buildActorIndex(): Promise<void> {
  await buildIndex(indexMap.actors, Actor.getAll, indexActors);
}

export interface IActorSearchQuery {
  query: string;
  favorite?: boolean;
  bookmark?: boolean;
  rating: number;
  include?: string[];
  exclude?: string[];
  nationality?: string;
  sortBy?: string;
  sortDir?: string;
  skip?: number;
  take?: number;
  page?: number;
}

export async function searchActors(
  options: Partial<IActorSearchQuery>,
  shuffleSeed = "default",
  extraFilter: unknown[] = []
): Promise<ISearchResults> {
  logger.log(`Searching actors for '${options.query || "<no query>"}'...`);

  const includeFilter = () => {
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

  const excludeFilter = () => {
    if (options.exclude && options.exclude.length) {
      return [
        {
          query_string: {
            query: `(${options.exclude.map((name) => `-labels:${name}`).join(" AND ")})`,
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
            fields: ["name^1.5", "labelNames", "nationalityName^0.75"],
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

  const nationality = () => {
    if (options.nationality) {
      return [
        {
          term: {
            countryCode: options.nationality,
          },
        },
      ];
    }
    return [];
  };

  const result = await getClient().search<IActorSearchDoc>({
    index: indexMap.actors,
    ...getPage(options.page, options.skip, options.take),
    body: {
      ...sort(),
      track_total_hits: true,
      query: {
        bool: {
          must: isShuffle ? shuffle() : query().filter(Boolean),
          filter: [
            ...includeFilter(),
            ...excludeFilter(),
            {
              range: {
                rating: {
                  gte: options.rating || 0,
                },
              },
            },
            ...bookmark(),
            ...favorite(),
            ...nationality(),
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
