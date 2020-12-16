import Studio from "../types/studio";
import { getClient, indexMap } from "../search";
import Actor from "../types/actor";
import { getNationality } from "../types/countries";
import Scene from "../types/scene";
import { mapAsync } from "../utils/async";
import * as logger from "../utils/logger";
import {
  arrayFilter,
  bookmark,
  excludeFilter,
  favorite,
  getPage,
  getPageSize,
  includeFilter,
  ISearchResults,
  normalizeAliases,
  ratingFilter,
  shuffle,
  sort,
} from "./common";
import { addSearchDocs, buildIndex, indexItems, ProgressCallback } from "./internal/buildIndex";

export interface IActorSearchDoc {
  id: string;
  addedOn: number;
  name: string;
  aliases: string[];
  labels: string[];
  labelNames: string[];
  rating: number;
  averageRating: number;
  score: number;
  bookmark: number | null;
  favorite: boolean;
  numViews: number;
  bornOn: number | null;
  age: number | null;
  numScenes: number;
  nationalityName: string | null;
  countryCode: string | null;
  custom: Record<string, boolean | string | number | string[] | null>;
  studios: string[];
  studioNames: string[];
}

export async function createActorSearchDoc(actor: Actor): Promise<IActorSearchDoc> {
  const labels = await Actor.getLabels(actor);

  const numViews = (await Actor.getWatches(actor)).length;
  const numScenes = (await Scene.getByActor(actor._id)).length;

  const nationality = actor.nationality ? getNationality(actor.nationality) : null;

  const baseStudios = await Actor.getStudioFeatures(actor);
  const studios = [...new Set((await mapAsync(baseStudios, Studio.getParents)).flat())];

  return {
    id: actor._id,
    addedOn: actor.addedOn,
    name: actor.name,
    aliases: normalizeAliases(actor.aliases),
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => l.name),
    score: Actor.calculateScore(actor, numViews, numScenes),
    rating: actor.rating,
    averageRating: await Actor.getAverageRating(actor),
    bookmark: actor.bookmark,
    favorite: actor.favorite,
    numViews,
    bornOn: actor.bornOn,
    numScenes,
    age: Actor.getAge(actor),
    nationalityName: nationality ? nationality.nationality : null,
    countryCode: nationality ? nationality.alpha2 : null,
    custom: actor.customFields,
    studios: studios.map((st) => st._id),
    studioNames: studios.map((st) => st.name),
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
  studios?: string[];
}

export async function searchActors(
  options: Partial<IActorSearchQuery>,
  shuffleSeed = "default",
  extraFilter: unknown[] = []
): Promise<ISearchResults> {
  logger.log(`Searching actors for '${options.query || "<no query>"}'...`);

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

            ...arrayFilter(options.studios, "studios", "OR"),

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
