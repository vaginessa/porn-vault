import { resolve } from "path";

import { getConfig } from "../../config";
import { ApplyActorLabelsEnum } from "../../config/schema";
import countries, { ICountry } from "../../data/countries";
import { imageCollection, labelCollection } from "../../database";
import { buildFieldExtractor, buildLabelExtractor } from "../../extractor";
import { runPluginsSerial } from "../../plugins";
import { indexImages } from "../../search/image";
import Actor from "../../types/actor";
import { isValidCountryCode } from "../../types/countries";
import Image from "../../types/image";
import Label from "../../types/label";
import { downloadFile } from "../../utils/download";
import * as logger from "../../utils/logger";
import { validRating } from "../../utils/misc";
import { libraryPath } from "../../utils/path";
import { extensionFromUrl } from "../../utils/string";

// This function has side effects
export async function onActorCreate(
  actor: Actor,
  actorLabels: string[],
  event: "actorCreated" | "actorCustom" = "actorCreated"
): Promise<Actor> {
  const config = getConfig();

  const createdImages = [] as Image[];

  const pluginResult = await runPluginsSerial(config, event, {
    actor: JSON.parse(JSON.stringify(actor)) as Actor,
    actorName: actor.name,
    countries: JSON.parse(JSON.stringify(countries)) as ICountry[],
    $createLocalImage: async (path: string, name: string, thumbnail?: boolean) => {
      path = resolve(path);
      logger.log(`Creating image from ${path}`);
      if (await Image.getImageByPath(path)) {
        logger.warn(`Image ${path} already exists in library`);
        return null;
      }
      const img = new Image(name);
      if (thumbnail) {
        img.name += " (thumbnail)";
      }
      img.path = path;
      await Image.setActors(img, [actor._id]);
      logger.log(`Created image ${img._id}`);
      await imageCollection.upsert(img._id, img);
      if (!thumbnail) {
        createdImages.push(img);
      }
      return img._id;
    },
    $createImage: async (url: string, name: string, thumbnail?: boolean) => {
      // if (!isValidUrl(url)) throw new Error(`Invalid URL: ` + url);
      logger.log(`Creating image from ${url}`);
      const img = new Image(name);
      if (thumbnail) {
        img.name += " (thumbnail)";
      }
      const ext = extensionFromUrl(url);
      const path = libraryPath(`images/${img._id}${ext}`);
      await downloadFile(url, path);
      img.path = path;
      await Image.setActors(img, [actor._id]);
      logger.log(`Created image ${img._id}`);
      await imageCollection.upsert(img._id, img);
      if (!thumbnail) {
        createdImages.push(img);
      }
      return img._id;
    },
  });

  if (
    typeof pluginResult.thumbnail === "string" &&
    pluginResult.thumbnail.startsWith("im_") &&
    (!actor.thumbnail || config.plugins.allowActorThumbnailOverwrite)
  ) {
    actor.thumbnail = pluginResult.thumbnail;
  }

  if (
    typeof pluginResult.altThumbnail === "string" &&
    pluginResult.altThumbnail.startsWith("im_") &&
    (!actor.altThumbnail || config.plugins.allowActorThumbnailOverwrite)
  ) {
    actor.altThumbnail = pluginResult.altThumbnail;
  }

  if (
    typeof pluginResult.avatar === "string" &&
    pluginResult.avatar.startsWith("im_") &&
    (!actor.avatar || config.plugins.allowActorThumbnailOverwrite)
  ) {
    actor.avatar = pluginResult.avatar;
  }

  if (
    typeof pluginResult.hero === "string" &&
    pluginResult.hero.startsWith("im_") &&
    (!actor.hero || config.plugins.allowActorThumbnailOverwrite)
  ) {
    actor.hero = pluginResult.hero;
  }

  if (typeof pluginResult.name === "string") {
    actor.name = pluginResult.name;
  }

  if (typeof pluginResult.description === "string") {
    actor.description = pluginResult.description;
  }

  if (typeof pluginResult.bornOn === "number") {
    actor.bornOn = new Date(pluginResult.bornOn).valueOf();
  }

  if (typeof pluginResult.addedOn === "number") {
    actor.addedOn = new Date(pluginResult.addedOn).valueOf();
  }

  if (pluginResult.aliases && Array.isArray(pluginResult.aliases)) {
    actor.aliases.push(...pluginResult.aliases);
    actor.aliases = [...new Set(actor.aliases)];
  }

  if (pluginResult.custom && typeof pluginResult.custom === "object") {
    const localExtractFields = await buildFieldExtractor();
    for (const key in pluginResult.custom) {
      const fields = localExtractFields(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (fields.length) actor.customFields[fields[0]] = pluginResult.custom[key];
    }
  }

  if (validRating(pluginResult.rating)) {
    actor.rating = pluginResult.rating;
  }

  if (typeof pluginResult.favorite === "boolean") {
    actor.favorite = pluginResult.favorite;
  }

  if (typeof pluginResult.bookmark === "number") {
    actor.bookmark = pluginResult.bookmark;
  }

  if (pluginResult.nationality !== undefined) {
    if (
      typeof pluginResult.nationality === "string" &&
      isValidCountryCode(pluginResult.nationality)
    ) {
      actor.nationality = pluginResult.nationality.toUpperCase();
    } else if (pluginResult.nationality === null) {
      actor.nationality = pluginResult.nationality;
    }
  }

  if (pluginResult.labels && Array.isArray(pluginResult.labels)) {
    const labelIds = [] as string[];
    const localExtractLabels = await buildLabelExtractor();
    for (const labelName of pluginResult.labels) {
      const extractedIds = localExtractLabels(labelName);
      if (extractedIds.length) {
        labelIds.push(...extractedIds);
        logger.log(`Found ${extractedIds.length} labels for ${<string>labelName}:`);
        logger.log(extractedIds);
      } else if (config.plugins.createMissingLabels) {
        const label = new Label(labelName);
        labelIds.push(label._id);
        await labelCollection.upsert(label._id, label);
        logger.log(`Created label ${label.name}`);
      }
    }
    actorLabels.push(...labelIds);
  }

  for (const image of createdImages) {
    if (
      (event === "actorCreated" &&
        config.matching.applyActorLabels.includes(
          ApplyActorLabelsEnum.enum["plugin:actor:create"]
        )) ||
      (event === "actorCustom" &&
        config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["plugin:actor:custom"]))
    ) {
      await Image.setLabels(image, actorLabels);
    }
    await indexImages([image]);
  }

  return actor;
}
