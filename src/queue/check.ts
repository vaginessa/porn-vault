import Jimp from "jimp";
import { basename } from "path";

import { getConfig } from "../config";
import { imageCollection, sceneCollection } from "../database";
import { extractActors, extractLabels, extractScenes } from "../extractor";
import { indexImages } from "../search/image";
import Image from "../types/image";
import Scene from "../types/scene";
import { statAsync, walk } from "../utils/fs/async";
import * as logger from "../utils/logger";
import { libraryPath } from "../utils/path";
import ora = require("ora");

export async function checkVideoFolders(): Promise<void> {
  const config = getConfig();

  const unknownVideos = [] as string[];

  if (config.scan.excludeFiles.length) {
    logger.log(`Will ignore files: ${JSON.stringify(config.scan.excludeFiles)}.`);
  }

  for (const folder of config.import.videos) {
    logger.message(`Scanning ${folder} for videos...`);
    let numFiles = 0;
    const loader = ora(`Scanned ${numFiles} videos`).start();

    await walk({
      dir: folder,
      exclude: config.scan.excludeFiles,
      extensions: [".mp4", ".webm"],
      cb: async (path) => {
        loader.text = `Scanned ${++numFiles} videos`;
        if (basename(path).startsWith(".")) {
          logger.log(`Ignoring file ${path}`);
        } else {
          logger.log(`Found matching file ${path}`);
          const existingScene = await Scene.getSceneByPath(path);
          logger.log(`Scene with that path exists already: ${!!existingScene}`);
          if (!existingScene) unknownVideos.push(path);
        }
      },
    });

    loader.succeed(`${folder} done (${numFiles} videos)`);
  }

  logger.log(`Found ${unknownVideos.length} new videos.`);

  for (const videoPath of unknownVideos) {
    try {
      await Scene.onImport(videoPath);
    } catch (error) {
      const _err = error as Error;
      logger.log(_err.stack);
      logger.error(`Error when importing ${videoPath}`);
      logger.warn(_err.message);
    }
  }

  logger.warn(`Queued ${unknownVideos.length} new videos for further processing.`);
}

async function imageWithPathExists(path: string) {
  const image = await Image.getImageByPath(path);
  return !!image;
}

async function processImage(imagePath: string, readImage = true, generateThumb = true) {
  try {
    const imageName = basename(imagePath);
    const image = new Image(imageName);
    image.path = imagePath;

    let jimpImage: Jimp | undefined;
    if (readImage) {
      jimpImage = await Jimp.read(imagePath);
      image.meta.dimensions.width = jimpImage.bitmap.width;
      image.meta.dimensions.height = jimpImage.bitmap.height;
      image.hash = jimpImage.hash();
    }

    // Extract scene
    const extractedScenes = await extractScenes(imagePath);
    logger.log(`Found ${extractedScenes.length} scenes in image path.`);
    image.scene = extractedScenes[0] || null;
    // Extract actors
    const extractedActors = await extractActors(imagePath);
    logger.log(`Found ${extractedActors.length} actors in image path.`);
    await Image.setActors(image, [...new Set(extractedActors)]);

    // Extract labels
    const extractedLabels = await extractLabels(imagePath);
    logger.log(`Found ${extractedLabels.length} labels in image path.`);
    await Image.setLabels(image, [...new Set(extractedLabels)]);

    if (generateThumb) {
      if (!jimpImage) {
        jimpImage = await Jimp.read(imagePath);
      }
      // Small image thumbnail
      logger.log("Creating image thumbnail");
      if (jimpImage.bitmap.width > jimpImage.bitmap.height && jimpImage.bitmap.width > 320) {
        jimpImage.resize(320, Jimp.AUTO);
      } else if (jimpImage.bitmap.height > 320) {
        jimpImage.resize(Jimp.AUTO, 320);
      }
      image.thumbPath = libraryPath(`thumbnails/images/${image._id}.jpg`);
      await jimpImage.writeAsync(image.thumbPath);
    }

    await imageCollection.upsert(image._id, image);
    await indexImages([image]);
    logger.success(`Image '${imageName}' done.`);
  } catch (error) {
    logger.error(error);
    logger.error(`Failed to add image '${imagePath}'.`);
  }
}

export async function checkImageFolders(): Promise<void> {
  const config = getConfig();

  logger.log("Checking image folders...");

  let numAddedImages = 0;

  if (!config.processing.readImagesOnImport) {
    logger.warn("Reading images on import is disabled.");
  }

  if (config.scan.excludeFiles.length) {
    logger.log(`Will ignore files: ${JSON.stringify(config.scan.excludeFiles)}.`);
  }

  for (const folder of config.import.images) {
    logger.message(`Scanning ${folder} for images...`);
    let numFiles = 0;
    const loader = ora(`Scanned ${numFiles} images`).start();

    await walk({
      dir: folder,
      extensions: [".jpg", ".jpeg", ".png", ".gif"],
      exclude: config.scan.excludeFiles,
      cb: async (path) => {
        loader.text = `Scanned ${++numFiles} images`;
        if (basename(path).startsWith(".")) return;

        if (!(await imageWithPathExists(path))) {
          await processImage(
            path,
            config.processing.readImagesOnImport,
            config.processing.generateImageThumbnails
          );
          numAddedImages++;
          logger.log(`Added image '${path}'.`);
        } else {
          logger.log(`Image '${path}' already exists`);
        }
      },
    });

    loader.succeed(`${folder} done`);
  }

  logger.warn(`Added ${numAddedImages} new images`);
}

export async function checkPreviews(): Promise<void> {
  const config = getConfig();

  if (!config.processing.generatePreviews) {
    logger.warn("Not generating previews because GENERATE_PREVIEWS is disabled.");
    return;
  }

  const scenes = await sceneCollection.query("preview-index", null);

  logger.log(`Generating previews for ${scenes.length} scenes...`);

  for (const scene of scenes) {
    if (scene.path) {
      const loader = ora("Generating previews...").start();

      try {
        const preview = await Scene.generatePreview(scene);

        if (preview) {
          const image = new Image(`${scene.name} (preview)`);
          const stats = await statAsync(preview);
          image.path = preview;
          image.scene = scene._id;
          image.meta.size = stats.size;

          await imageCollection.upsert(image._id, image);
          await indexImages([image]);

          scene.thumbnail = image._id;
          await sceneCollection.upsert(scene._id, scene);

          loader.succeed(`Generated preview for ${scene._id}`);
        } else {
          loader.fail(`Error generating preview.`);
        }
      } catch (error) {
        logger.error(error);
        loader.fail(`Error generating preview.`);
      }
    }
  }
}
