import { getConfig } from "../../config";
import { ApplyActorLabelsEnum } from "../../config/schema";
import { actorCollection } from "../../database";
import { onActorCreate } from "../../plugins/events/actor";
import { index as actorIndex, indexActors, updateActors } from "../../search/actor";
import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import { isValidCountryCode } from "../../types/countries";
import LabelledItem from "../../types/labelled_item";
import * as logger from "../../utils/logger";
import { Dictionary } from "../../utils/types";

type IActorUpdateOpts = Partial<{
  name: string;
  description: string;
  rating: number;
  labels: string[];
  aliases: string[];
  avatar: string;
  thumbnail: string;
  altThumbnail: string;
  hero: string;
  favorite: boolean;
  bookmark: number | null;
  bornOn: number;
  customFields: Dictionary<string[] | boolean | string | null>;
  nationality: string | null;
}>;

async function runActorPlugins(ids: string[]) {
  const updatedActors = [] as Actor[];
  for (const id of ids) {
    let actor = await Actor.getById(id);

    if (actor) {
      logger.message(`Running plugin action event for '${actor.name}'...`);

      const labels = (await Actor.getLabels(actor)).map((l) => l._id);
      actor = await onActorCreate(actor, labels, "actorCustom");

      await Actor.setLabels(actor, labels);
      await actorCollection.upsert(actor._id, actor);

      updatedActors.push(actor);
    } else {
      logger.warn(`Actor ${id} not found`);
    }

    await updateActors(updatedActors);
  }
  return updatedActors;
}

export default {
  async runActorPlugins(_: unknown, { id }: { id: string }): Promise<Actor> {
    const result = await runActorPlugins([id]);
    return result[0];
  },

  async addActor(
    _: unknown,
    args: { name: string; aliases?: string[]; labels?: string[] }
  ): Promise<Actor> {
    const config = getConfig();
    let actor = new Actor(args.name, args.aliases);

    let actorLabels = [] as string[];
    if (args.labels) {
      actorLabels = args.labels;
    }

    try {
      actor = await onActorCreate(actor, actorLabels);
    } catch (error) {
      logger.error(error);
    }

    await Actor.setLabels(actor, actorLabels);
    await actorCollection.upsert(actor._id, actor);

    await Actor.attachToScenes(
      actor,
      config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["event:actor:create"])
        ? actorLabels
        : []
    );

    await indexActors([actor]);

    return actor;
  },

  async updateActors(
    _: unknown,
    { ids, opts }: { ids: string[]; opts: IActorUpdateOpts }
  ): Promise<Actor[]> {
    const config = getConfig();
    const updatedActors = [] as Actor[];

    for (const id of ids) {
      const actor = await Actor.getById(id);

      if (actor) {
        if (Array.isArray(opts.aliases)) {
          actor.aliases = [...new Set(opts.aliases)];
        }

        if (Array.isArray(opts.labels)) {
          await Actor.setLabels(actor, opts.labels);
        }

        if (typeof opts.nationality !== undefined) {
          if (typeof opts.nationality === "string" && isValidCountryCode(opts.nationality)) {
            actor.nationality = opts.nationality;
          } else if (opts.nationality === null) {
            actor.nationality = opts.nationality;
          }
        }

        if (typeof opts.bookmark === "number" || opts.bookmark === null) {
          actor.bookmark = opts.bookmark;
        }

        if (typeof opts.favorite === "boolean") {
          actor.favorite = opts.favorite;
        }

        if (typeof opts.name === "string") {
          actor.name = opts.name.trim();
        }

        if (typeof opts.description === "string") {
          actor.description = opts.description.trim();
        }

        if (typeof opts.avatar === "string" || opts.avatar === null) {
          actor.avatar = opts.avatar;
        }

        if (typeof opts.thumbnail === "string" || opts.thumbnail === null) {
          actor.thumbnail = opts.thumbnail;
        }

        if (typeof opts.altThumbnail === "string" || opts.altThumbnail === null) {
          actor.altThumbnail = opts.altThumbnail;
        }

        if (typeof opts.hero === "string" || opts.hero === null) {
          actor.hero = opts.hero;
        }

        if (typeof opts.rating === "number") {
          actor.rating = opts.rating;
        }

        if (opts.bornOn !== undefined) {
          actor.bornOn = opts.bornOn;
        }

        if (opts.customFields) {
          for (const key in opts.customFields) {
            const value = opts.customFields[key] !== undefined ? opts.customFields[key] : null;
            logger.log(`Set actor custom.${key} to ${JSON.stringify(value)}`);
            opts.customFields[key] = value;
          }
          actor.customFields = opts.customFields;
        }

        await actorCollection.upsert(actor._id, actor);
        updatedActors.push(actor);
      } else {
        throw new Error(`Actor ${id} not found`);
      }

      await Actor.attachToScenes(
        actor,
        config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["event:actor:update"])
          ? (await Actor.getLabels(actor)).map((l) => l._id)
          : []
      );
    }

    await updateActors(updatedActors);
    return updatedActors;
  },

  async removeActors(_: unknown, { ids }: { ids: string[] }): Promise<boolean> {
    for (const id of ids) {
      const actor = await Actor.getById(id);

      if (actor) {
        await Actor.remove(actor);
        await actorIndex.remove([actor._id]);
        await LabelledItem.removeByItem(actor._id);
        await ActorReference.removeByActor(actor._id);
      }
    }
    return true;
  },
};
