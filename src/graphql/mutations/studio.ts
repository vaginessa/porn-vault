import { getConfig } from "../../config";
import { ApplyStudioLabelsEnum } from "../../config/schema";
import { studioCollection } from "../../database";
import { onStudioCreate } from "../../plugins/events/studio";
import { indexStudios, removeStudio } from "../../search/studio";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Movie from "../../types/movie";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import * as logger from "../../utils/logger";
import { isArrayEq } from "../../utils/misc";
import { Dictionary } from "../../utils/types";

// Used as interface, but typescript still complains
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type IStudioUpdateOpts = Partial<{
  name: string;
  description: string;
  thumbnail: string;
  favorite: boolean;
  bookmark: boolean;
  parent: string | null;
  labels: string[];
  aliases: string[];
  customFields: Dictionary<string[] | boolean | string | null>;
}>;

async function runStudioPlugins(ids: string[]) {
  const updatedStudios = [] as Studio[];
  for (const id of ids) {
    let studio = await Studio.getById(id);

    if (studio) {
      const labels = (await Studio.getLabels(studio)).map((l) => l._id);
      logger.log("Labels before plugin: ", labels);
      studio = await onStudioCreate(studio, labels, "studioCustom");
      logger.log("Labels after plugin: ", labels);

      await Studio.setLabels(studio, labels);
      await studioCollection.upsert(studio._id, studio);

      updatedStudios.push(studio);
    }

    await indexStudios(updatedStudios);
  }
  return updatedStudios;
}

export default {
  async runStudioPlugins(_: unknown, { id }: { id: string }): Promise<Studio> {
    const result = await runStudioPlugins([id]);
    return result[0];
  },

  async addStudio(_: unknown, opts: { name: string; labels?: string[] }): Promise<Studio> {
    const config = getConfig();

    for (const label of opts.labels || []) {
      const labelInDb = await Label.getById(label);
      if (!labelInDb) throw new Error(`Label ${label} not found`);
    }

    let studio = new Studio(opts.name);

    const studioLabels = Array.isArray(opts.labels) ? opts.labels : [];

    try {
      studio = await onStudioCreate(studio, studioLabels);
    } catch (error) {
      logger.error(error);
    }

    await Studio.setLabels(studio, studioLabels);
    await studioCollection.upsert(studio._id, studio);
    await indexStudios([studio]);
    await Studio.attachToNewScenes(
      studio,
      config.matching.applyStudioLabels.includes(ApplyStudioLabelsEnum.enum["event:studio:create"])
        ? studioLabels
        : []
    );
    return studio;
  },

  async updateStudios(
    _: unknown,
    { ids, opts }: { ids: string[]; opts: IStudioUpdateOpts }
  ): Promise<Studio[]> {
    const config = getConfig();
    const updatedStudios = [] as Studio[];

    let shouldPushLabels = false;
    let shouldAttachToNewScenes = false;

    for (const id of ids) {
      const studio = await Studio.getById(id);

      if (studio) {
        if (typeof opts.name === "string") {
          const oldName = studio.name;
          studio.name = opts.name.trim();
          if (oldName !== studio.name) {
            shouldAttachToNewScenes = shouldAttachToNewScenes || true;
          }
        }

        if (Array.isArray(opts.aliases)) {
          const oldAliases = studio.aliases?.length ? [...studio.aliases] : [];
          studio.aliases = [...new Set(opts.aliases)];
          shouldAttachToNewScenes =
            shouldAttachToNewScenes ||
            !isArrayEq(
              oldAliases,
              studio.aliases,
              (a) => a,
              (a) => a
            );
        }

        if (typeof opts.description === "string") {
          studio.description = opts.description.trim();
        }

        if (typeof opts.thumbnail === "string") {
          studio.thumbnail = opts.thumbnail;
        }

        if (opts.parent !== undefined) {
          studio.parent = opts.parent;
        }

        if (typeof opts.bookmark === "number" || opts.bookmark === null) {
          studio.bookmark = opts.bookmark;
        }

        if (typeof opts.favorite === "boolean") {
          studio.favorite = opts.favorite;
        }

        if (Array.isArray(opts.labels)) {
          const oldLabels = await Studio.getLabels(studio);
          await Studio.setLabels(studio, opts.labels);
          if (
            !isArrayEq(
              oldLabels,
              opts.labels,
              (l) => l._id,
              (l) => l
            )
          ) {
            shouldPushLabels = true;
          }
        }

        if (opts.customFields) {
          for (const key in opts.customFields) {
            const value = opts.customFields[key] !== undefined ? opts.customFields[key] : null;
            logger.log(`Set studio custom.${key} to ${JSON.stringify(value)}`);
            opts.customFields[key] = value;
          }
          studio.customFields = opts.customFields;
        }

        await studioCollection.upsert(studio._id, studio);

        const labelsToPush = config.matching.applyStudioLabels.includes(
          ApplyStudioLabelsEnum.enum["event:studio:update"]
        )
          ? (await Studio.getLabels(studio)).map((l) => l._id)
          : [];

        if (shouldPushLabels) {
          await Studio.updateSceneLabels(studio, labelsToPush);
        }
        if (shouldAttachToNewScenes) {
          await Studio.attachToNewScenes(studio, labelsToPush);
        }

        updatedStudios.push(studio);
      }
    }

    await indexStudios(updatedStudios);
    return updatedStudios;
  },

  async removeStudios(_: unknown, { ids }: { ids: string[] }): Promise<boolean> {
    for (const id of ids) {
      const studio = await Studio.getById(id);

      if (studio) {
        await studioCollection.remove(studio._id);
        await removeStudio(studio._id);
        await Studio.filterStudio(studio._id);
        await Scene.filterStudio(studio._id);
        await Movie.filterStudio(studio._id);
        await Image.filterStudio(studio._id);

        await LabelledItem.removeByItem(studio._id);
      }
    }
    return true;
  },
};
