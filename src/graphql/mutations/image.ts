import { createWriteStream, ReadStream } from "fs";
import Jimp from "jimp";
import { extname } from "path";

import { getConfig } from "../../config";
import { ApplyActorLabelsEnum } from "../../config/schema";
import { imageCollection } from "../../database";
import { extractActors, extractLabels } from "../../extractor";
import { index as imageIndex, indexImages, isBlacklisted, updateImages } from "../../search/image";
import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import { mapAsync } from "../../utils/async";
import { copyFileAsync, statAsync, unlinkAsync } from "../../utils/fs/async";
import * as logger from "../../utils/logger";
import { libraryPath } from "../../utils/path";
import { Dictionary } from "../../utils/types";

type IImageUpdateOpts = Partial<{
  name: string;
  rating: number;
  labels: string[];
  actors: string[];
  favorite: boolean;
  bookmark: boolean;
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
    const ext = extname(filename);
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

    logger.log(`Getting file...`);

    const read = createReadStream() as ReadStream;
    const write = createWriteStream(outPath);

    const pipe = read.pipe(write);

    await new Promise((resolve) => {
      pipe.on("close", () => resolve());
    });

    const { size } = await statAsync(outPath);
    image.meta.size = size;

    // File written, now process
    logger.success(`File written to ${outPath}.`);

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

      const _image = await Jimp.read(outPath);
      image.hash = _image.hash();

      if (args.crop) {
        logger.log(`Cropping image...`);
        _image.crop(args.crop.left, args.crop.top, args.crop.width, args.crop.height);
        image.meta.dimensions.width = args.crop.width;
        image.meta.dimensions.height = args.crop.height;
      } else {
        image.meta.dimensions.width = _image.bitmap.width;
        image.meta.dimensions.height = _image.bitmap.height;
      }

      if (args.compress === true) {
        logger.log("Resizing image to thumbnail size");
        const MAX_SIZE = config.processing.imageCompressionSize;

        if (_image.bitmap.width > _image.bitmap.height && _image.bitmap.width > MAX_SIZE) {
          _image.resize(MAX_SIZE, Jimp.AUTO);
        } else if (_image.bitmap.height > MAX_SIZE) {
          _image.resize(Jimp.AUTO, MAX_SIZE);
        }
      }

      await _image.writeAsync(sourcePath);

      if (!isBlacklisted(image.name)) {
        image.thumbPath = libraryPath(`thumbnails/images/${image._id}.jpg`);
        logger.log("Creating image thumbnail");
        // Small image thumbnail
        if (_image.bitmap.width > _image.bitmap.height && _image.bitmap.width > 320) {
          _image.resize(320, Jimp.AUTO);
        } else if (_image.bitmap.height > 320) {
          _image.resize(Jimp.AUTO, 320);
        }
        await _image.writeAsync(image.thumbPath);
      }

      logger.success(`Image processing done.`);
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
    logger.log(`Found ${extractedActors.length} actors in image path.`);
    actorIds.push(...extractedActors);
    await Image.setActors(image, actorIds);

    // Extract labels
    const extractedLabels = await extractLabels(image.name);
    logger.log(`Found ${extractedLabels.length} labels in image path.`);
    labels.push(...extractedLabels);

    if (
      config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["event:image:create"])
    ) {
      logger.log("Applying actor labels to image");
      const actors = await Actor.getBulk(actorIds);
      const actorLabels = (
        await mapAsync(actors, async (actor) => (await Actor.getLabels(actor)).map((l) => l._id))
      ).flat();
      labels.push(...actorLabels);
    }

    await Image.setLabels(image, labels);

    // Done

    await imageCollection.upsert(image._id, image);
    // await database.insert(database.store.images, image);
    await indexImages([image]);
    await unlinkAsync(outPath);
    logger.success(`Image '${imageName}' done.`);
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

            logger.log("Applying actor labels to image");
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
            logger.log(`Set scene custom.${key} to ${JSON.stringify(value)}`);
            opts.customFields[key] = value;
          }
          image.customFields = opts.customFields;
        }

        await imageCollection.upsert(image._id, image);
        updatedImages.push(image);
      } else {
        throw new Error(`Image ${id} not found`);
      }
    }

    await updateImages(updatedImages);
    return updatedImages;
  },

  async removeImages(_: unknown, { ids }: { ids: string[] }): Promise<boolean> {
    for (const id of ids) {
      const image = await Image.getById(id);

      if (image) {
        await Image.remove(image);
        await imageIndex.remove([image._id]);
        await LabelledItem.removeByItem(image._id);
        await ActorReference.removeByItem(image._id);
      }
    }
    return true;
  },
};
