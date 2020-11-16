import { labelCollection, studioCollection } from "../../database/index";
import { getLength, isProcessing } from "../../queue/processing";
import { index as actorIndex } from "../../search/actor";
import { index as imageIndex } from "../../search/image";
import { index as movieIndex } from "../../search/movie";
import { index as sceneIndex } from "../../search/scene";
import { index as studioIndex } from "../../search/studio";
import Actor from "../../types/actor";
import CustomField from "../../types/custom_field";
import Image from "../../types/image";
import Label from "../../types/label";
import Movie from "../../types/movie";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import SceneView from "../../types/watch";
import { mapAsync } from "../../utils/async";
import { getActors, getUnwatchedActors } from "./search/actor";
import { getImages } from "./search/image";
import { getMarkers } from "./search/marker";
import { getMovies } from "./search/movie";
import { getScenes } from "./search/scene";
import { getStudios } from "./search/studio";

export default {
  async getWatches(
    _: void,
    { min, max }: { min: number | null; max: number | null }
  ): Promise<SceneView[]> {
    return (await SceneView.getAll()).filter(
      (w) => w.date >= (min || -99999999999999) && w.date <= (max || 99999999999999)
    );
  },

  async getScenesWithoutStudios(_: unknown, { num }: { num: number }): Promise<Scene[]> {
    const numStudios = await studioCollection.count();
    if (numStudios === 0) return [];

    return (await Scene.getAll()).filter((s) => s.studio === null).slice(0, num || 12);
  },

  async getScenesWithoutLabels(_: unknown, { num }: { num: number }): Promise<Scene[]> {
    return (
      await mapAsync(await Scene.getAll(), async (scene) => ({
        scene,
        numLabels: (await Scene.getLabels(scene)).length,
      }))
    )
      .filter((i) => i.numLabels === 0)
      .map((i) => i.scene)
      .slice(0, num || 12);
  },

  async getActorsWithoutLabels(_: unknown, { num }: { num: number }): Promise<Actor[]> {
    return (
      await mapAsync(await Actor.getAll(), async (actor) => ({
        actor,
        numLabels: (await Actor.getLabels(actor)).length,
      }))
    )
      .filter((i) => i.numLabels === 0)
      .map((i) => i.actor)
      .slice(0, num || 12);
  },

  async getScenesWithoutActors(_: unknown, { num }: { num: number }): Promise<Scene[]> {
    return (
      await mapAsync(await Scene.getAll(), async (scene) => ({
        scene,
        numActors: (await Scene.getActors(scene)).length,
      }))
    )
      .filter((i) => i.numActors === 0)
      .map((i) => i.scene)
      .slice(0, num || 12);
  },

  async getActorsWithoutScenes(_: unknown, { num }: { num: number }): Promise<Actor[]> {
    return (
      await mapAsync(await Actor.getAll(), async (actor) => ({
        actor,
        numScenes: (await Scene.getByActor(actor._id)).length,
      }))
    )
      .filter((i) => i.numScenes === 0)
      .map((i) => i.actor)
      .slice(0, num || 12);
  },

  async topActors(
    _: unknown,
    { skip, take }: { skip: number; take: number }
  ): Promise<(Actor | null)[]> {
    return Actor.getTopActors(skip, take);
  },

  getUnwatchedActors,

  async getQueueInfo(): Promise<{
    length: number;
    processing: boolean;
  }> {
    return {
      length: await getLength(),
      processing: isProcessing(),
    };
  },

  getStudios,
  getMovies,
  getActors,
  getScenes,
  getImages,
  getMarkers,

  async getImageById(_: unknown, { id }: { id: string }): Promise<Image | null> {
    return await Image.getById(id);
  },

  async getSceneById(_: unknown, { id }: { id: string }): Promise<Scene | null> {
    return await Scene.getById(id);
  },

  async getActorById(_: unknown, { id }: { id: string }): Promise<Actor | null> {
    return await Actor.getById(id);
  },

  async getMovieById(_: unknown, { id }: { id: string }): Promise<Movie | null> {
    return await Movie.getById(id);
  },

  async getStudioById(_: unknown, { id }: { id: string }): Promise<Studio | null> {
    return await Studio.getById(id);
  },

  async getLabelById(_: unknown, { id }: { id: string }): Promise<Label | null> {
    return await Label.getById(id);
  },
  async getCustomFields(): Promise<CustomField[]> {
    return await CustomField.getAll();
  },
  async getLabels(): Promise<Label[]> {
    const labels = await Label.getAll();
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  async numScenes(): Promise<number> {
    return await sceneIndex.count();
  },
  async numActors(): Promise<number> {
    return await actorIndex.count();
  },
  async numMovies(): Promise<number> {
    return movieIndex.count();
  },
  async numLabels(): Promise<number> {
    return labelCollection.count();
  },
  async numStudios(): Promise<number> {
    return studioIndex.count();
  },
  async numImages(): Promise<number> {
    return await imageIndex.count();
  },
};
