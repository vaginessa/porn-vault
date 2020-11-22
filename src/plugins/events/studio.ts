import { resolve } from "path";

import { getConfig } from "../../config";
import { ApplyStudioLabelsEnum } from "../../config/schema";
import { imageCollection, labelCollection, studioCollection } from "../../database";
import { buildFieldExtractor, buildLabelExtractor, extractStudios } from "../../extractor";
import { runPluginsSerial } from "../../plugins";
import { index as imageIndex, indexImages } from "../../search/image";
import { indexStudios } from "../../search/studio";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Studio from "../../types/studio";
import { downloadFile } from "../../utils/download";
import * as logger from "../../utils/logger";
import { libraryPath } from "../../utils/path";
import { extensionFromUrl } from "../../utils/string";

export const MAX_STUDIO_RECURSIVE_CALLS = 4;

// This function has side effects
export async function onStudioCreate(
  studio: Studio,
  studioLabels: string[],
  event: "studioCreated" | "studioCustom" = "studioCreated",
  studioStack: string[] = []
): Promise<Studio> {
  const config = getConfig();

  const createdImages = [] as Image[];

  const pluginResult = await runPluginsSerial(config, event, {
    studio: JSON.parse(JSON.stringify(studio)) as Studio,
    studioName: studio.name,
    $createLocalImage: async (path: string, name: string, thumbnail?: boolean) => {
      path = resolve(path);
      logger.log(`Creating image from ${path}`);
      if (await Image.getImageByPath(path)) {
        logger.warn(`Image ${path} already exists in library`);
        return null;
      }
      const img = new Image(name);
      if (thumbnail) img.name += " (thumbnail)";
      img.path = path;
      img.studio = studio._id;
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
      if (thumbnail) img.name += " (thumbnail)";
      const ext = extensionFromUrl(url);
      const path = libraryPath(`images/${img._id}${ext}`);
      await downloadFile(url, path);
      img.path = path;
      img.studio = studio._id;
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
    const localExtractFields = await buildFieldExtractor();
    for (const key in pluginResult.custom) {
      const fields = localExtractFields(key);
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
    studioLabels.push(...labelIds);
  }

  if (
    !studio.parent &&
    pluginResult.parent &&
    typeof pluginResult.parent === "string" &&
    studio.name !== pluginResult.parent // studio cannot be it's own parent to prevent circular references
  ) {
    const studioId = (await extractStudios(pluginResult.parent))[0] || null;

    if (studioId && studioId !== studio._id) {
      // Prevent linking parent to itself
      studio.parent = studioId;
    } else if (
      studioId !== studio._id &&
      config.plugins.createMissingStudios &&
      studioStack.length < MAX_STUDIO_RECURSIVE_CALLS &&
      !studioStack.some((prevName) => prevName === studio.name) // Prevent linking parent to a grandchild
    ) {
      let createdStudio = new Studio(pluginResult.parent);

      try {
        const nextStack = [...studioStack, studio.name];
        createdStudio = await onStudioCreate(createdStudio, [], "studioCreated", nextStack);
      } catch (error) {
        const _err = error as Error;
        logger.log(_err);
        logger.error(_err.message);
      }

      if (studio.name === createdStudio.name) {
        logger.error(
          `For current studio "${studio.name}", tried run plugin on parent "${pluginResult.parent}", but plugin returned the current studio. Ignoring result`
        );
        const thumbnailImage = createdStudio.thumbnail
          ? await Image.getById(createdStudio.thumbnail)
          : null;
        if (thumbnailImage) {
          await Image.remove(thumbnailImage);
          await imageIndex.remove([thumbnailImage._id]);
          await LabelledItem.removeByItem(thumbnailImage._id);
        }
      } else {
        await studioCollection.upsert(createdStudio._id, createdStudio);
        logger.log(`Created studio ${createdStudio.name}`);
        studio.parent = createdStudio._id;
        logger.log(`Attached ${studio.name} to studio ${createdStudio.name}`);
        await indexStudios([createdStudio]);
      }
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

  const shouldApplyStudioLabels =
    (event === "studioCreated" &&
      config.matching.applyStudioLabels.includes(
        ApplyStudioLabelsEnum.enum["plugin:studio:create"]
      )) ||
    (event === "studioCustom" &&
      config.matching.applyStudioLabels.includes(
        ApplyStudioLabelsEnum.enum["plugin:studio:custom"]
      ));
  for (const image of createdImages) {
    if (shouldApplyStudioLabels) {
      await Image.setLabels(image, studioLabels);
    }
    await indexImages([image]);
  }

  return studio;
}
