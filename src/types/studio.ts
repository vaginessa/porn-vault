import { getConfig } from "../config";
import { sceneCollection, studioCollection } from "../database";
import { buildStudioExtractor } from "../extractor";
import { ignoreSingleNames } from "../matching/matcher";
import { updateScenes } from "../search/scene";
import { mapAsync } from "../utils/async";
import { generateHash } from "../utils/hash";
import * as logger from "../utils/logger";
import { createObjectSet } from "../utils/misc";
import Actor from "./actor";
import Label from "./label";
import Movie from "./movie";
import Scene from "./scene";

export default class Studio {
  _id: string;
  name: string;
  description: string | null = null;
  thumbnail: string | null = null;
  addedOn: number = +new Date();
  favorite = false;
  bookmark: number | null = null;
  parent: string | null = null;
  aliases?: string[];
  customFields: Record<string, boolean | string | number | string[] | null> = {};

  constructor(name: string) {
    this._id = `st_${generateHash()}`;
    this.name = name;
  }

  static async remove(studioId: string): Promise<void> {
    await studioCollection.remove(studioId);
  }

  static async filterStudio(studioId: string): Promise<void> {
    for (const studio of await Studio.getSubStudios(studioId)) {
      studio.parent = null;
      await studioCollection.upsert(studio._id, studio);
    }
  }

  static async getById(_id: string): Promise<Studio | null> {
    return studioCollection.get(_id);
  }

  static async getBulk(_ids: string[]): Promise<Studio[]> {
    return studioCollection.getBulk(_ids);
  }

  static async getAll(): Promise<Studio[]> {
    return studioCollection.getAll();
  }

  static async getScenes(studio: Studio): Promise<Scene[]> {
    const scenes = await Scene.getByStudio(studio._id);
    const subStudios = await Studio.getSubStudios(studio._id);

    const scenesOfSubStudios = (
      await Promise.all(subStudios.map((child) => Studio.getScenes(child)))
    ).flat();

    return scenes.concat(scenesOfSubStudios);
  }

  static async getMovies(studio: Studio): Promise<Movie[]> {
    const movies = await Movie.getByStudio(studio._id);

    const moviesOfSubStudios = (
      await Promise.all(
        (await Studio.getSubStudios(studio._id)).map((child) => Studio.getMovies(child))
      )
    ).flat();

    return movies.concat(moviesOfSubStudios);
  }

  static async getSubStudios(studioId: string): Promise<Studio[]> {
    return studioCollection.query("parent-index", studioId);
  }

  static async getActors(studio: Studio): Promise<Actor[]> {
    const scenes = await Studio.getScenes(studio);
    const actorIds = [
      ...new Set((await mapAsync(scenes, Scene.getActors)).flat().map((a) => a._id)),
    ];
    return await Actor.getBulk(actorIds);
  }

  static async setLabels(studio: Studio, labelIds: string[]): Promise<void> {
    return Label.setForItem(studio._id, labelIds, "studio");
  }

  static async getLabels(studio: Studio): Promise<Label[]> {
    return Label.getForItem(studio._id);
  }

  static async inferLabels(studio: Studio): Promise<Label[]> {
    const scenes = await Studio.getScenes(studio);
    const labels = (await mapAsync(scenes, Scene.getLabels)).flat();
    return createObjectSet(labels, "_id");
  }

  /**
   * Attaches the studio and its labels to all matching or existing scenes
   *
   * @param studio - the studio
   * @param studioLabels - the studio's labels. Will be applied to scenes if given
   */
  static async attachToScenes(studio: Studio, studioLabels?: string[]): Promise<void> {
    const config = getConfig();
    // Prevent looping on scenes if we know it'll never be matched
    if (
      config.matching.matcher.options.ignoreSingleNames &&
      !ignoreSingleNames([studio.name]).length
    ) {
      return;
    }

    const localExtractStudio = await buildStudioExtractor([studio]);

    for (const scene of await Scene.getAll()) {
      if (
        scene.studio === studio._id ||
        localExtractStudio(scene.path || scene.name)[0] === studio._id
      ) {
        if (scene.studio === null) {
          scene.studio = studio._id;
        }

        if (studioLabels?.length) {
          const sceneLabels = (await Scene.getLabels(scene)).map((l) => l._id);
          await Scene.setLabels(scene, sceneLabels.concat(studioLabels));
          logger.log(`Applied studio labels to scene ${scene._id}`);
        }

        await sceneCollection.upsert(scene._id, scene);
        await updateScenes([scene]);
        logger.log(`Updated scene ${scene._id}`);
      }
    }
  }
}
