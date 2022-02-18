import execa from "execa";
import { createWriteStream, ReadStream } from "fs";

import { getImageDimensions } from "../../binaries/imagemagick";
import { getConfig } from "../../config";
import { ApplyActorLabelsEnum } from "../../config/schema";
import { collections } from "../../database";
import { extractActors, extractLabels } from "../../extractor";
import {
  indexImages,
  isBlacklisted,
  removeImages as removeImagesFromIndex,
} from "../../search/image";
import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import { mapAsync } from "../../utils/async";
import { copyFileAsync, statAsync, unlinkAsync } from "../../utils/fs/async";
import { logger } from "../../utils/logger";
import { libraryPath } from "../../utils/path";
import { getExtension } from "../../utils/string";
import { Dictionary } from "../../utils/types";

type IImageUpdateOpts = Partial<{
  name: string;
  rating: number;
  labels: string[];
  actors: string[];
  favorite: boolean;
  bookmark: number | null;
  studio: string | null;
  scene: string | null;
  customFields: Dictionary<string[] | boolean | string | null>;
  color: string | null;
}>;

const COLOR_HEX_STRING = /^#[a-f0-9]{6}$/;

function isHexColorString(str: string) {
  return COLOR_HEX_STRING.test(str);
}

export default {
  async uploadImage(
    _: unknown,
    args: {
      file: Promise<{
        filename: string;
        mimetype: string;
        createReadStream: () => NodeJS.ReadableStream;
      }>;
      name: string;
      scene?: string;
      studio?: string;
      actors: string[];
      labels: string[];
      lossless?: boolean;
      compress?: boolean;
      crop?: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
    }
  ): Promise<Image> {
    for (const actor of args.actors || []) {
      const actorInDb = await Actor.getById(actor);

      if (!actorInDb) throw new Error(`Actor ${actor} not found`);
    }

    for (const label of args.labels || []) {
      const labelInDb = await Label.getById(label);

      if (!labelInDb) throw new Error(`Label ${label} not found`);
    }

    if (args.scene) {
      const sceneInDb = await Scene.getById(args.scene);

      if (!sceneInDb) throw new Error(`Scene ${args.scene} not found`);
    }

    const config = getConfig();

    const { filename, mimetype, createReadStream } = await args.file;
    const ext = getExtension(filename);
    const fileNameWithoutExtension = filename.split(".")[0];

    let imageName = fileNameWithoutExtension;

    if (args.name) {
      imageName = args.name;
    }

    if (!mimetype.includes("image/")) {
      throw new Error("Invalid file");
    }

    const image = new Image(imageName);

    const outPath = `tmp/${image._id}${ext}`;

    logger.debug(`Getting file...`);

    const read = createReadStream() as ReadStream;
    const write = createWriteStream(outPath);

    const pipe = read.pipe(write);

    await new Promise<void>((resolve) => {
      pipe.on("close", () => resolve());
    });

    const { size } = await statAsync(outPath);
    image.meta.size = size;

    // File written, now process
    logger.verbose(`File written to ${outPath}.`);

    let processedExt = ".jpg";
    if (args.lossless === true) {
      processedExt = ".png";
    }
    if (filename.includes(".gif")) {
      processedExt = ".gif";
    }

    const sourcePath = libraryPath(`images/${image._id}${processedExt}`);
    image.path = sourcePath;

    // Process image
    if (!filename.includes(".gif")) {
      if (args.crop) {
        args.crop.left = Math.round(args.crop.left);
        args.crop.top = Math.round(args.crop.top);
        args.crop.width = Math.round(args.crop.width);
        args.crop.height = Math.round(args.crop.height);
      }

      if (args.crop) {
        logger.verbose(`Cropping image`);
        const cropArgs = [
          outPath,
          "-crop",
          `${args.crop.width}x${args.crop.height}+${args.crop.left}+${args.crop.top}`,
          "+repage",
          outPath,
        ];
        logger.debug(cropArgs);
        execa.sync(config.imagemagick.convertPath, cropArgs);
        image.meta.dimensions.width = args.crop.width;
        image.meta.dimensions.height = args.crop.height;
      } else {
        const dims = getImageDimensions(outPath);
        image.meta.dimensions.width = dims.width;
        image.meta.dimensions.height = dims.height;
      }

      if (args.compress === true) {
        logger.verbose("Resizing image to thumbnail size");
        const MAX_SIZE = config.processing.imageCompressionSize;

        image.thumbPath = libraryPath(`thumbnails/images/${image._id}.jpg`);
        execa.sync(config.imagemagick.convertPath, [
          outPath,
          "-resize",
          `${MAX_SIZE}x${MAX_SIZE}`,
          outPath,
        ]);
        await copyFileAsync(outPath, image.thumbPath);
      }

      if (!isBlacklisted(image.name)) {
        // Small image thumbnail
        image.thumbPath = libraryPath(`thumbnails/images/${image._id}.jpg`);
        logger.verbose("Creating image thumbnail");

        execa.sync(config.imagemagick.convertPath, [
          outPath,
          "-resize",
          "320x320",
          image.thumbPath,
        ]);
      }

      await copyFileAsync(outPath, sourcePath);

      logger.verbose(`Image processing done.`);
    } else {
      await copyFileAsync(outPath, sourcePath);
    }

    let actorIds = [] as string[];
    if (args.actors) {
      actorIds = args.actors;
    }

    let labels = [] as string[];
    if (args.labels) {
      labels = args.labels;
    }

    if (args.scene) {
      const scene = await Scene.getById(args.scene);

      if (scene) {
        image.scene = args.scene;

        const sceneActors = (await Scene.getActors(scene)).map((a) => a._id);
        actorIds.push(...sceneActors);
        const sceneLabels = (await Scene.getLabels(scene)).map((a) => a._id);
        labels.push(...sceneLabels);
      }
    }

    if (args.studio) {
      const studio = await Studio.getById(args.studio);
      if (studio) image.studio = args.studio;
    }

    // Extract actors
    const extractedActors = await extractActors(image.name);
    logger.verbose(`Found ${extractedActors.length} actors in image path.`);
    actorIds.push(...extractedActors);
    await Image.setActors(image, actorIds);

    // Extract labels
    const extractedLabels = await extractLabels(image.name);
    logger.verbose(`Found ${extractedLabels.length} labels in image path.`);
    labels.push(...extractedLabels);

    if (
      config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["event:image:create"])
    ) {
      logger.verbose("Applying actor labels to image");
      const actors = await Actor.getBulk(actorIds);
      const actorLabels = (
        await mapAsync(actors, async (actor) => (await Actor.getLabels(actor)).map((l) => l._id))
      ).flat();
      labels.push(...actorLabels);
    }

    await Image.setLabels(image, labels);

    // Done
    logger.debug("Creating image:");
    logger.debug(image);

    await collections.images.upsert(image._id, image);
    await indexImages([image]);
    await unlinkAsync(outPath);
    logger.verbose(`Image '${imageName}' done.`);
    return image;
  },

  async updateImages(
    _: unknown,
    { ids, opts }: { ids: string[]; opts: IImageUpdateOpts }
  ): Promise<Image[]> {
    const config = getConfig();
    const updatedImages = [] as Image[];

    for (const id of ids) {
      const image = await Image.getById(id);

      if (image) {
        const imageLabels: string[] = [];
        if (Array.isArray(opts.labels)) {
          // If the update sets labels, use those and ignore the existing
          imageLabels.push(...opts.labels);
        } else {
          const existingLabels = (await Image.getLabels(image)).map((l) => l._id);
          imageLabels.push(...existingLabels);
        }
        if (Array.isArray(opts.actors)) {
          const actorIds = [...new Set(opts.actors)];
          await Image.setActors(image, actorIds);

          if (
            config.matching.applyActorLabels.includes(
              ApplyActorLabelsEnum.enum["event:image:update"]
            )
          ) {
            const actors = await Actor.getBulk(actorIds);
            const actorLabelIds = (await mapAsync(actors, Actor.getLabels))
              .flat()
              .map((label) => label._id);

            logger.debug("Applying actor labels to image");
            imageLabels.push(...actorLabelIds);
          }
        }

        await Image.setLabels(image, imageLabels);

        if (typeof opts.bookmark === "number" || opts.bookmark === null) {
          image.bookmark = opts.bookmark;
        }

        if (typeof opts.favorite === "boolean") {
          image.favorite = opts.favorite;
        }

        if (typeof opts.name === "string") {
          image.name = opts.name.trim();
        }

        if (typeof opts.rating === "number") {
          image.rating = opts.rating;
        }

        if (opts.studio !== undefined) {
          image.studio = opts.studio;
        }

        if (opts.scene !== undefined) {
          image.scene = opts.scene;
        }

        if (opts.color && isHexColorString(opts.color)) {
          image.color = opts.color;
        }

        if (opts.customFields) {
          for (const key in opts.customFields) {
            const value = opts.customFields[key] !== undefined ? opts.customFields[key] : null;
            logger.debug(`Set scene custom.${key} to ${JSON.stringify(value)}`);
            opts.customFields[key] = value;
          }
          image.customFields = opts.customFields;
        }

        await collections.images.upsert(image._id, image);
        updatedImages.push(image);
      } else {
        throw new Error(`Image ${id} not found`);
      }
    }

    await indexImages(updatedImages);
    return updatedImages;
  },

  async removeImages(_: unknown, { ids }: { ids: string[] }): Promise<boolean> {
    logger.debug(`Deleting images: ${JSON.stringify(ids, null, 2)}`);

    for (const id of ids) {
      const image = await Image.getById(id);

      if (image) {
        logger.silly(`Deleting ${image._id}`);
        await Image.remove(image);
        logger.silly(`Removing labels from: ${image._id}`);
        await LabelledItem.removeByItem(image._id);
        logger.silly(`Removing actors from: ${image._id}`);
        await ActorReference.removeByItem(image._id);
      }
    }

    await removeImagesFromIndex(ids);

    return true;
  },
};
