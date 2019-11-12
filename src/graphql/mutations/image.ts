import { database } from "../../database";
import Actor from "../../types/actor";
import Label from "../../types/label";
import Scene from "../../types/scene";
import Image from "../../types/image";
import { ReadStream, createWriteStream, statSync } from "fs";
import { extname } from "path";
import * as logger from "../../logger";
import { extractLabels, extractActors } from "../../extractor";
import { Dictionary, libraryPath } from "../../types/utility";

type IImageUpdateOpts = Partial<{
  name: string;
  rating: number;
  labels: string[];
  actors: string[];
  favorite: boolean;
  bookmark: boolean;
}>;

export default {
  async uploadImage(_, args: Dictionary<any>) {
    for (const actor of args.actors || []) {
      const actorInDb = Actor.getById(actor);

      if (!actorInDb) throw new Error(`Actor ${actor} not found`);
    }

    for (const label of args.labels || []) {
      const labelInDb = Label.getById(label);

      if (!labelInDb) throw new Error(`Label ${label} not found`);
    }

    if (args.scene) {
      const sceneInDb = Scene.getById(args.scene);

      if (!sceneInDb) throw new Error(`Scene ${args.scene} not found`);
    }

    const { filename, mimetype, createReadStream } = await args.file;
    const ext = extname(filename);
    const fileNameWithoutExtension = filename.split(".")[0];

    let imageName = fileNameWithoutExtension;

    if (args.name) imageName = args.name;

    if (!mimetype.includes("image/")) throw new Error("Invalid file");

    const image = new Image(imageName);

    const sourcePath = `images/${image.id}${ext}`;
    image.path = sourcePath;

    logger.LOG(`Getting file...`);

    const read = createReadStream() as ReadStream;
    const write = createWriteStream(libraryPath(sourcePath));

    const pipe = read.pipe(write);

    await new Promise((resolve, reject) => {
      pipe.on("close", () => resolve());
    });

    const { size } = statSync(libraryPath(sourcePath));
    image.meta.size = size;

    // TODO: extract image dimensions

    // File written, now process
    logger.SUCCESS(`SUCCESS: File written to ${sourcePath}.`);

    if (args.actors) {
      image.actors = args.actors;
    }

    // Extract actors
    const extractedActors = extractActors(image.name);
    logger.LOG(`Found ${extractedActors.length} actors in scene title.`);
    image.actors.push(...extractedActors);
    image.actors = [...new Set(image.actors)];

    if (args.labels) {
      image.labels = args.labels;
    }

    // Extract labels
    const extractedLabels = extractLabels(image.name);
    logger.LOG(`Found ${extractedLabels.length} labels in image title.`);
    image.labels.push(...extractedLabels);
    image.labels = [...new Set(image.labels)];

    database
      .get("images")
      .push(image)
      .write();

    // Done

    logger.SUCCESS(`SUCCESS: Image '${imageName}' done.`);

    return image;
  },

  addActorsToImage(_, { id, actors }: { id: string; actors: string[] }) {
    const image = Image.getById(id);

    if (image) {
      if (Array.isArray(actors)) image.actors.push(...actors);

      image.actors = [...new Set(image.actors)];

      database
        .get("images")
        .find({ id: image.id })
        .assign(image)
        .write();

      return image;
    } else {
      throw new Error(`Image ${id} not found`);
    }
  },

  updateImages(_, { ids, opts }: { ids: string[]; opts: IImageUpdateOpts }) {
    const updatedImages = [] as Image[];

    for (const id of ids) {
      const image = Image.getById(id);

      if (image) {
        if (Array.isArray(opts.actors)) image.actors = opts.actors;

        if (Array.isArray(opts.labels)) image.labels = opts.labels;

        if (typeof opts.bookmark == "boolean") image.bookmark = opts.bookmark;

        if (typeof opts.favorite == "boolean") image.favorite = opts.favorite;

        if (typeof opts.name == "string") image.name = opts.name;

        if (typeof opts.rating == "number") image.rating = opts.rating;

        database
          .get("images")
          .find({ id: image.id })
          .assign(image)
          .write();

        updatedImages.push(image);
      } else {
        throw new Error(`Image ${id} not found`);
      }
    }

    return updatedImages;
  },

  removeImages(_, { ids }: { ids: string[] }) {
    for (const id of ids) {
      const image = Image.getById(id);

      if (image) {
        Image.remove(image.id);

        Actor.filterImage(image.id);
        Scene.filterImage(image.id);
        Label.filterImage(image.id);

        return true;
      }
    }
  }
};
