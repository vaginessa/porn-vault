import { labelCollection } from "../../database";
import { buildLabelExtractor } from "../../extractor";
import { updateActors } from "../../search/actor";
import { updateImages } from "../../search/image";
import { updateScenes } from "../../search/scene";
import { updateStudios } from "../../search/studio";
import Actor from "../../types/actor";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import * as logger from "../../utils/logger";

type ILabelUpdateOpts = Partial<{
  name: string;
  aliases: string[];
  thumbnail: string;
}>;

export default {
  async removeLabel(_: unknown, { item, label }: { item: string; label: string }): Promise<true> {
    await LabelledItem.remove(item, label);

    if (item.startsWith("sc_")) {
      const scene = await Scene.getById(item);
      if (scene) {
        await updateScenes([scene]);
      }
    } else if (item.startsWith("im_")) {
      const image = await Image.getById(item);
      if (image) {
        await updateImages([image]);
      }
    } else if (item.startsWith("st_")) {
      const studio = await Studio.getById(item);
      if (studio) {
        await updateStudios([studio]);
      }
    } else if (item.startsWith("ac_")) {
      const actor = await Actor.getById(item);
      if (actor) {
        await updateActors([actor]);
      }
    }

    return true;
  },
  async removeLabels(_: unknown, { ids }: { ids: string[] }): Promise<boolean> {
    for (const id of ids) {
      const label = await Label.getById(id);

      if (label) {
        await Label.remove(label._id);
        await LabelledItem.removeByLabel(id);
      }
    }
    return true;
  },

  async addLabel(_: unknown, args: { name: string; aliases?: string[] }): Promise<Label> {
    const label = new Label(args.name, args.aliases);

    const localExtractLabels = await buildLabelExtractor([label]);
    for (const scene of await Scene.getAll()) {
      if (localExtractLabels(scene.path || scene.name).includes(label._id)) {
        const labels = (await Scene.getLabels(scene)).map((l) => l._id);
        labels.push(label._id);
        await Scene.setLabels(scene, labels);
        await updateScenes([scene]);
        logger.log(`Updated labels of ${scene._id}.`);
      }
    }

    /* for (const image of await Image.getAll()) {
      if (isBlacklisted(image.name)) continue;

      if (isMatchingItem(image.path || image.name, label, false)) {
        const labels = (await Image.getLabels(image)).map((l) => l._id);
        labels.push(label._id);
        await Image.setLabels(image, labels);
        await updateImages([image]);
        logger.log(`Updated labels of ${image._id}.`);
      }
    } */

    await labelCollection.upsert(label._id, label);
    return label;
  },

  async updateLabels(
    _: unknown,
    { ids, opts }: { ids: string[]; opts: ILabelUpdateOpts }
  ): Promise<Label[]> {
    const updatedLabels = [] as Label[];

    for (const id of ids) {
      const label = await Label.getById(id);

      if (label) {
        if (Array.isArray(opts.aliases)) label.aliases = [...new Set(opts.aliases)];

        if (typeof opts.name === "string") label.name = opts.name.trim();

        if (typeof opts.thumbnail === "string") label.thumbnail = opts.thumbnail;

        await labelCollection.upsert(label._id, label);
        updatedLabels.push(label);
      } else {
        throw new Error(`Label ${id} not found`);
      }
    }

    return updatedLabels;
  },
};
