import { resolve } from "path";

import { getConfig } from "../../config";
import { imageCollection, studioCollection } from "../../database";
import { buildFieldExtractor, extractStudios } from "../../extractor";
import { runPluginsSerial } from "../../plugins";
import { indexImages } from "../../search/image";
import { indexStudios } from "../../search/studio";
import Image from "../../types/image";
import Movie from "../../types/movie";
import Studio from "../../types/studio";
import { downloadFile } from "../../utils/download";
import * as logger from "../../utils/logger";
import { validRating } from "../../utils/misc";
import { libraryPath } from "../../utils/path";
import { extensionFromUrl } from "../../utils/string";

// This function has side effects
export async function onMovieCreate(
  movie: Movie,
  event: "movieCreated" = "movieCreated"
): Promise<Movie> {
  const config = getConfig();

  const pluginResult = await runPluginsSerial(config, event, {
    movie: JSON.parse(JSON.stringify(movie)) as Movie,
    movieName: movie.name,
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
      logger.log(`Created image ${img._id}`);
      await imageCollection.upsert(img._id, img);
      if (!thumbnail) {
        await indexImages([img]);
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
      logger.log(`Created image ${img._id}`);
      await imageCollection.upsert(img._id, img);
      if (!thumbnail) {
        await indexImages([img]);
      }
      return img._id;
    },
  });

  if (
    typeof pluginResult.frontCover === "string" &&
    pluginResult.frontCover.startsWith("im_") &&
    (!movie.frontCover || config.plugins.allowMovieThumbnailOverwrite)
  ) {
    movie.frontCover = pluginResult.frontCover;
  }

  if (
    typeof pluginResult.backCover === "string" &&
    pluginResult.backCover.startsWith("im_") &&
    (!movie.backCover || config.plugins.allowMovieThumbnailOverwrite)
  ) {
    movie.backCover = pluginResult.backCover;
  }

  if (
    typeof pluginResult.spineCover === "string" &&
    pluginResult.spineCover.startsWith("im_") &&
    (!movie.spineCover || config.plugins.allowMovieThumbnailOverwrite)
  ) {
    movie.spineCover = pluginResult.spineCover;
  }

  if (typeof pluginResult.name === "string") {
    movie.name = pluginResult.name;
  }

  if (typeof pluginResult.description === "string") {
    movie.description = pluginResult.description;
  }

  if (typeof pluginResult.releaseDate === "number") {
    movie.releaseDate = new Date(pluginResult.releaseDate).valueOf();
  }

  if (typeof pluginResult.addedOn === "number") {
    movie.addedOn = new Date(pluginResult.addedOn).valueOf();
  }

  if (validRating(pluginResult.rating)) {
    movie.rating = pluginResult.rating;
  }

  if (typeof pluginResult.favorite === "boolean") {
    movie.favorite = pluginResult.favorite;
  }

  if (typeof pluginResult.bookmark === "number") {
    movie.bookmark = pluginResult.bookmark;
  }

  if (pluginResult.custom && typeof pluginResult.custom === "object") {
    const localExtractFields = await buildFieldExtractor();
    for (const key in pluginResult.custom) {
      const fields = localExtractFields(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (fields.length) movie.customFields[fields[0]] = pluginResult.custom[key];
    }
  }

  if (!movie.studio && pluginResult.studio && typeof pluginResult.studio === "string") {
    const studioId = (await extractStudios(pluginResult.studio))[0] || null;

    if (studioId) movie.studio = studioId;
    else if (config.plugins.createMissingStudios) {
      const studio = new Studio(pluginResult.studio);
      movie.studio = studio._id;
      await studioCollection.upsert(studio._id, studio);
      await indexStudios([studio]);
      logger.log(`Created studio ${studio.name}`);
    }
  }

  return movie;
}
