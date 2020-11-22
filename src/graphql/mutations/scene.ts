import { getConfig } from "../../config";
import { ApplyActorLabelsEnum, ApplyStudioLabelsEnum } from "../../config/schema";
import { sceneCollection } from "../../database";
import { extractActors, extractLabels } from "../../extractor";
import { onSceneCreate } from "../../plugins/events/scene";
import { removeSceneFromQueue } from "../../queue/processing";
import { index as sceneIndex, updateScenes } from "../../search/scene";
import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Marker from "../../types/marker";
import MovieScene from "../../types/movie_scene";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import { mapAsync } from "../../utils/async";
import * as logger from "../../utils/logger";
import { Dictionary } from "../../utils/types";

type ISceneUpdateOpts = Partial<{
  favorite: boolean;
  bookmark: number;
  actors: string[];
  name: string;
  description: string;
  rating: number;
  labels: string[];
  streamLinks: string[];
  thumbnail: string;
  releaseDate: number;
  studio: string | null;
  customFields: Dictionary<string[] | boolean | string | null>;
}>;

async function runScenePlugins(ids: string[]) {
  const updatedScenes = [] as Scene[];
  for (const id of ids) {
    let scene = await Scene.getById(id);

    if (scene) {
      const labels = (await Scene.getLabels(scene)).map((l) => l._id);
      const actors = (await Scene.getActors(scene)).map((a) => a._id);
      logger.log("Labels before plugin: ", labels);
      scene = await onSceneCreate(scene, labels, actors, "sceneCustom");
      logger.log("Labels after plugin: ", labels);

      await Scene.setLabels(scene, labels);
      await Scene.setActors(scene, actors);
      await sceneCollection.upsert(scene._id, scene);

      updatedScenes.push(scene);
    }

    await updateScenes(updatedScenes);
  }
  return updatedScenes;
}

export default {
  async runScenePlugins(_: unknown, { id }: { id: string }): Promise<Scene> {
    const result = await runScenePlugins([id]);
    return result[0];
  },

  async screenshotScene(
    _: unknown,
    { id, sec }: { id: string; sec: number }
  ): Promise<Image | null> {
    const scene = await Scene.getById(id);

    if (scene) {
      const image = await Scene.screenshot(scene, sec);
      return image;
    }
    return null;
  },

  async unwatchScene(_: unknown, { id }: { id: string }): Promise<Scene | null> {
    const scene = await Scene.getById(id);

    if (scene) {
      await Scene.unwatch(scene);
      return scene;
    }
    return null;
  },

  async watchScene(_: unknown, { id }: { id: string }): Promise<Scene | null> {
    const scene = await Scene.getById(id);

    if (scene) {
      await Scene.watch(scene);
      return scene;
    }
    return null;
  },

  async addScene(
    _: unknown,
    args: { actors: string[]; labels: string[]; name: string }
  ): Promise<Scene> {
    for (const actor of args.actors || []) {
      const actorInDb = await Actor.getById(actor);
      if (!actorInDb) throw new Error(`Actor ${actor} not found`);
    }

    for (const label of args.labels || []) {
      const labelInDb = await Label.getById(label);
      if (!labelInDb) throw new Error(`Label ${label} not found`);
    }

    const config = getConfig();

    const sceneName = args.name;
    const scene = new Scene(sceneName);

    let actorIds = [] as string[];
    if (args.actors) {
      actorIds = args.actors;
    }

    // Extract actors
    const extractedActors = await extractActors(scene.name);
    logger.log(`Found ${extractedActors.length} actors in scene title.`);
    actorIds.push(...extractedActors);
    await Scene.setActors(scene, actorIds);

    let labels = [] as string[];
    if (args.labels) {
      labels = args.labels;
    }

    // Extract labels
    const extractedLabels = await extractLabels(scene.name);
    logger.log(`Found ${extractedLabels.length} labels in scene title.`);
    labels.push(...extractedLabels);

    if (
      config.matching.applyActorLabels.includes(ApplyActorLabelsEnum.enum["event:scene:create"])
    ) {
      logger.log("Applying actor labels to scene");
      const actors = await Actor.getBulk(actorIds);
      const actorLabels = (
        await mapAsync(actors, async (actor) => (await Actor.getLabels(actor)).map((l) => l._id))
      ).flat();
      labels.push(...actorLabels);
    }

    await Scene.setLabels(scene, labels);
    await sceneCollection.upsert(scene._id, scene);
    logger.success(`Scene '${sceneName}' done.`);
    return scene;
  },

  async updateScenes(
    _: unknown,
    { ids, opts }: { ids: string[]; opts: ISceneUpdateOpts }
  ): Promise<Scene[]> {
    const config = getConfig();
    const updatedScenes: Scene[] = [];

    for (const id of ids) {
      const scene = await Scene.getById(id);

      if (scene) {
        const labelsToApply = (await Scene.getLabels(scene)).map((l) => l._id);
        if (typeof opts.name === "string") {
          scene.name = opts.name.trim();
        }

        if (typeof opts.description === "string") {
          scene.description = opts.description.trim();
        }

        if (typeof opts.thumbnail === "string") {
          scene.thumbnail = opts.thumbnail;
        }

        if (opts.studio !== undefined) {
          scene.studio = opts.studio;

          if (opts.studio) {
            const studio = await Studio.getById(opts.studio);

            if (studio) {
              if (
                config.matching.applyStudioLabels.includes(
                  ApplyStudioLabelsEnum.enum["event:scene:update"]
                )
              ) {
                const studioLabels = (await Studio.getLabels(studio)).map((l) => l._id);
                logger.log("Applying studio labels to scene");
                labelsToApply.push(...studioLabels);
              }
            }
          }
        }

        if (Array.isArray(opts.labels)) {
          // If the update sets labels, use those and ignore the existing
          labelsToApply.push(...opts.labels);
        } else {
          const existingLabels = (await Scene.getLabels(scene)).map((l) => l._id);
          labelsToApply.push(...existingLabels);
        }
        if (Array.isArray(opts.actors)) {
          const actorIds = [...new Set(opts.actors)];
          await Scene.setActors(scene, actorIds);

          if (
            config.matching.applyActorLabels.includes(
              ApplyActorLabelsEnum.enum["event:scene:update"]
            )
          ) {
            const actors = await Actor.getBulk(actorIds);
            const actorLabelIds = (await mapAsync(actors, Actor.getLabels))
              .flat()
              .map((l) => l._id);

            logger.log("Applying actor labels to scene");
            labelsToApply.push(...actorLabelIds);
          }
        }
        await Scene.setLabels(scene, labelsToApply);

        if (Array.isArray(opts.streamLinks)) {
          scene.streamLinks = [...new Set(opts.streamLinks)];
        }

        if (typeof opts.bookmark === "number" || opts.bookmark === null) {
          scene.bookmark = opts.bookmark;
        }

        if (typeof opts.favorite === "boolean") {
          scene.favorite = opts.favorite;
        }

        if (typeof opts.rating === "number") {
          scene.rating = opts.rating;
        }

        if (opts.releaseDate !== undefined) {
          scene.releaseDate = opts.releaseDate;
        }

        if (opts.customFields) {
          for (const key in opts.customFields) {
            const value = opts.customFields[key] !== undefined ? opts.customFields[key] : null;
            logger.log(`Set scene custom.${key} to ${JSON.stringify(value)}`);
            opts.customFields[key] = value;
          }
          scene.customFields = opts.customFields;
        }

        await sceneCollection.upsert(scene._id, scene);
        updatedScenes.push(scene);
      }
    }

    await updateScenes(updatedScenes);
    return updatedScenes;
  },

  async removeScenes(
    _: unknown,
    { ids, deleteImages }: { ids: string[]; deleteImages?: boolean }
  ): Promise<boolean> {
    for (const id of ids) {
      const scene = await Scene.getById(id);

      if (scene) {
        await Scene.remove(scene);
        await sceneIndex.remove([scene._id]);
        await Image.filterScene(scene._id);

        if (deleteImages === true) {
          for (const image of await Image.getByScene(scene._id)) {
            await Image.remove(image);
            await LabelledItem.removeByItem(image._id);
          }
          logger.success(`Deleted images of scene ${scene._id}`);
        }

        await Marker.removeByScene(scene._id);

        logger.success(`Deleted scene ${scene._id}`);

        await LabelledItem.removeByItem(scene._id);
        // await MarkerReference.removeByScene(scene._id);
        await ActorReference.removeByItem(scene._id);
        await MovieScene.removeByScene(scene._id);

        logger.log("Deleting scene from queue (if needed)");
        try {
          await removeSceneFromQueue(scene._id);
        } catch (err) {
          const _err = err as Error;
          logger.warn(`Could not delete scene ${scene._id} from queue: ${_err.message}`);
        }
      }
    }
    return true;
  },
};
