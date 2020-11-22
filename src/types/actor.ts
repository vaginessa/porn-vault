import moment from "moment";

import { getConfig } from "../config";
import { actorCollection } from "../database";
import { buildActorExtractor } from "../extractor";
import { ignoreSingleNames } from "../matching/matcher";
import { searchActors } from "../search/actor";
import { updateScenes } from "../search/scene";
import { mapAsync } from "../utils/async";
import { generateHash } from "../utils/hash";
import * as logger from "../utils/logger";
import { createObjectSet } from "../utils/misc";
import Label from "./label";
import Movie from "./movie";
import Scene from "./scene";
import SceneView from "./watch";

export default class Actor {
  _id: string;
  name: string;
  aliases: string[] = [];
  addedOn = +new Date();
  bornOn: number | null = null;
  thumbnail: string | null = null;
  altThumbnail: string | null = null;
  hero?: string | null = null;
  avatar?: string | null = null;
  favorite = false;
  bookmark: number | null = null;
  rating = 0;
  customFields: Record<string, boolean | string | number | string[] | null> = {};

  description?: string | null = null;
  nationality?: string | null = null;

  static getAge(actor: Actor): number | null {
    if (actor.bornOn) return moment().diff(actor.bornOn, "years");
    return null;
  }

  static async remove(actor: Actor): Promise<Actor> {
    return actorCollection.remove(actor._id);
  }

  static async setLabels(actor: Actor, labelIds: string[]): Promise<void> {
    return Label.setForItem(actor._id, labelIds, "actor");
  }

  static async getLabels(actor: Actor): Promise<Label[]> {
    return Label.getForItem(actor._id);
  }

  static async getById(_id: string): Promise<Actor | null> {
    return actorCollection.get(_id);
  }

  static async getBulk(_ids: string[]): Promise<Actor[]> {
    return actorCollection.getBulk(_ids);
  }

  static async getAll(): Promise<Actor[]> {
    return actorCollection.getAll();
  }

  static async getWatches(actor: Actor): Promise<SceneView[]> {
    const scenes = await Scene.getByActor(actor._id);

    return (
      await mapAsync(scenes, (scene) => {
        return SceneView.getByScene(scene._id);
      })
    )
      .flat()
      .sort((a, b) => a.date - b.date);
  }

  static calculateScore(actor: Actor, numViews: number, numScenes: number): number {
    return (10 * numViews) / numScenes + numViews + +actor.favorite * 10 + actor.rating;
  }

  static async getLabelUsage(): Promise<
    {
      label: Label;
      score: number;
    }[]
  > {
    const scores = {} as Record<string, { label: Label; score: number }>;
    for (const actor of await Actor.getAll()) {
      for (const label of await Actor.getLabels(actor)) {
        const item = scores[label._id];
        scores[label._id] = item
          ? { label, score: item.score + 1 }
          : {
              label,
              score: 0,
            };
      }
    }
    return Object.keys(scores)
      .map((key) => ({
        label: scores[key].label,
        score: scores[key].score,
      }))
      .sort((a, b) => b.score - a.score);
  }

  static async getTopActors(skip = 0, take = 0): Promise<(Actor | null)[]> {
    const result = await searchActors({
      query: "",
      sortBy: "score",
      sortDir: "desc",
      skip,
      take,
    });
    return await Actor.getBulk(result.items);
  }

  constructor(name: string, aliases: string[] = []) {
    this._id = `ac_${generateHash()}`;
    this.name = name.trim();
    this.aliases = [...new Set(aliases.map((tag) => tag.trim()))];
  }

  static async getMovies(actor: Actor): Promise<Movie[]> {
    const scenes = await Scene.getByActor(actor._id);
    const movies = await mapAsync(scenes, Scene.getMovies);
    return createObjectSet(movies.flat(), "_id");
  }

  static async getCollabs(
    actor: Actor
  ): Promise<
    {
      scene: Scene;
      actors: Actor[];
    }[]
  > {
    const scenes = await Scene.getByActor(actor._id);

    return await mapAsync(scenes, async (scene) => {
      return {
        scene,
        actors: (await Scene.getActors(scene)).filter((ac) => ac._id !== actor._id),
      };
    });
  }

  /**
   * Attaches the actor and its labels to all matching or existing scenes
   *
   * @param actor - the actor
   * @param actorLabels - the actor's labels. Will be applied to scenes if given.
   */
  static async attachToScenes(actor: Actor, actorLabels?: string[]): Promise<void> {
    const config = getConfig();
    // Prevent looping on scenes if we know it'll never be matched
    if (
      config.matching.matcher.options.ignoreSingleNames &&
      !ignoreSingleNames([actor.name]).length
    ) {
      return;
    }

    const localExtractActors = await buildActorExtractor([actor]);

    for (const scene of await Scene.getAll()) {
      const sceneActorIds = (await Scene.getActors(scene)).map((a) => a._id);
      if (
        sceneActorIds.includes(actor._id) ||
        localExtractActors(scene.path || scene.name).includes(actor._id)
      ) {
        if (actorLabels?.length) {
          const sceneLabels = (await Scene.getLabels(scene)).map((l) => l._id);
          await Scene.setLabels(scene, sceneLabels.concat(actorLabels));
          logger.log(`Applied actor labels to scene ${scene._id}`);
        }
        await Scene.setActors(scene, sceneActorIds.concat(actor._id));
        try {
          await updateScenes([scene]);
        } catch (error) {
          logger.error(error);
        }
        logger.log(`Updated actors of ${scene._id}`);
      }
    }
  }
}
