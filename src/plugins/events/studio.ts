import { resolve } from "path";

import { getConfig } from "../../config";
import { imageCollection, labelCollection, studioCollection } from "../../database";
import { extractFields, extractLabels, extractStudios } from "../../extractor";
import { runPluginsSerial } from "../../plugins";
import { indexImages } from "../../search/image";
import { indexStudios } from "../../search/studio";
import Image from "../../types/image";
import Label from "../../types/label";
import Studio from "../../types/studio";
import { downloadFile } from "../../utils/download";
import * as logger from "../../utils/logger";
import { libraryPath } from "../../utils/misc";
import { extensionFromUrl } from "../../utils/string";

// This function has side effects
export async function onStudioCreate(
  studio: Studio,
  studioLabels: string[],
  event = "studioCreated"
): Promise<Studio> {
  const config = getConfig();

  const createdImages = [] as Image[];

  const pluginResult = await runPluginsSerial(config, event, {
    studio: JSON.parse(JSON.stringify(studio)) as Studio,
    studioName: studio.name,
    $createLocalImage: async (path: string, name: string, thumbnail?: boolean) => {
      path = resolve(path);
      logger.log("Creating image from " + path);
      if (await Image.getImageByPath(path)) {
        logger.warn(`Image ${path} already exists in library`);
        return null;
      }
      const img = new Image(name);
      if (thumbnail) img.name += " (thumbnail)";
      img.path = path;
      img.studio = studio._id;
      logger.log("Created image " + img._id);
      await imageCollection.upsert(img._id, img);
      if (!thumbnail) {
        createdImages.push(img);
      }
      return img._id;
    },
    $createImage: async (url: string, name: string, thumbnail?: boolean) => {
      // if (!isValidUrl(url)) throw new Error(`Invalid URL: ` + url);
      logger.log("Creating image from " + url);
      const img = new Image(name);
      if (thumbnail) img.name += " (thumbnail)";
      const ext = extensionFromUrl(url);
      const path = libraryPath(`images/${img._id}${ext}`);
      await downloadFile(url, path);
      img.path = path;
      img.studio = studio._id;
      logger.log("Created image " + img._id);
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
    (!studio.thumbnail || config.plugins.allowStudioThumbnailOverwrite)
  ) {
    studio.thumbnail = pluginResult.thumbnail;
  }

  if (typeof pluginResult.name === "string") {
    studio.name = pluginResult.name;
  }

  if (typeof pluginResult.description === "string") {
    studio.description = pluginResult.description;
  }

  if (typeof pluginResult.addedOn === "number") {
    studio.addedOn = new Date(pluginResult.addedOn).valueOf();
  }

  if (pluginResult.custom && typeof pluginResult.custom === "object") {
    for (const key in pluginResult.custom) {
      const fields = await extractFields(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (fields.length) studio.customFields[fields[0]] = pluginResult.custom[key];
    }
  }

  if (typeof pluginResult.favorite === "boolean") {
    studio.favorite = pluginResult.favorite;
  }

  if (typeof pluginResult.bookmark === "number") {
    studio.bookmark = pluginResult.bookmark;
  }

  if (pluginResult.labels && Array.isArray(pluginResult.labels)) {
    const labelIds = [] as string[];
    for (const labelName of pluginResult.labels) {
      const extractedIds = await extractLabels(labelName);
      if (extractedIds.length) {
        labelIds.push(...extractedIds);
        logger.log(`Found ${extractedIds.length} labels for ${<string>labelName}:`);
        logger.log(extractedIds);
      } else if (config.plugins.createMissingLabels) {
        const label = new Label(labelName);
        labelIds.push(label._id);
        await labelCollection.upsert(label._id, label);
        logger.log("Created label " + label.name);
      }
    }
    studioLabels.push(...labelIds);
  }

  if (
    !studio.parent &&
    pluginResult.parent &&
    typeof pluginResult.parent === "string" &&
    studio.name !== pluginResult.parent // studio cannot be it's own parent to prevent circular references
  ) {
    const studioId = (await extractStudios(pluginResult.parent))[0];

    if (studioId) studio.parent = studioId;
    else if (config.plugins.createMissingStudios) {
      let createdStudio = new Studio(pluginResult.parent);

      try {
        createdStudio = await onStudioCreate(createdStudio, [], "studioCreated");
      } catch (error) {
        const _err = error as Error;
        logger.log(_err);
        logger.error(_err.message);
      }

      await studioCollection.upsert(createdStudio._id, createdStudio);
      logger.log("Created studio " + createdStudio.name);
      studio.parent = createdStudio._id;
      logger.log(`Attached ${studio.name} to studio ${createdStudio.name}`);
      await indexStudios([createdStudio]);
    }
  }

  if (pluginResult.aliases && Array.isArray(pluginResult.aliases)) {
    if (studio.aliases) {
      studio.aliases.push(...pluginResult.aliases);
    } else {
      studio.aliases = [...(pluginResult.aliases as string[])];
    }
    studio.aliases = [...new Set(studio.aliases)];
  }

  for (const image of createdImages) {
    if (config.matching.applyStudioLabels) {
      await Image.setLabels(image, studioLabels);
    }
    await indexImages([image]);
  }

  return studio;
}
