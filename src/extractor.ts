import { getMatcher, MatchSource } from "./matching/matcher";
import Actor from "./types/actor";
import CustomField from "./types/custom_field";
import Label from "./types/label";
import Movie from "./types/movie";
import Scene from "./types/scene";
import Studio from "./types/studio";

export type MultiMatchExtractor = (str: string) => string[];

export type BestMatchExtractor = (str: string) => string;

/**
 * Builds an extractor that expects multiple item matches for the string
 *
 * @param getAll - retrieves all the items of that type
 * @param getItemInputs - retrieves the inputs to match an item with
 */
async function buildMultiMatchExtractor<T extends MatchSource>(
  getAll: () => Promise<T[]>,
  getItemInputs: (item: T) => string[]
): Promise<MultiMatchExtractor> {
  const allItems = await getAll();

  return (str: string) => {
    return getMatcher()
      .filterMatchingItems(allItems, str, getItemInputs)
      .map((s) => s._id);
  };
}

export async function buildFieldExtractor(): Promise<MultiMatchExtractor> {
  return buildMultiMatchExtractor(CustomField.getAll, (field) => [field.name]);
}

// Returns IDs of extracted custom fields
export async function extractFields(str: string): Promise<string[]> {
  return (await buildFieldExtractor())(str);
}

export async function buildLabelExtractor(): Promise<MultiMatchExtractor> {
  return buildMultiMatchExtractor(Label.getAll, (label) => [label.name, ...label.aliases]);
}

// Returns IDs of extracted labels
export async function extractLabels(str: string): Promise<string[]> {
  return (await buildLabelExtractor())(str);
}

export async function buildActorExtractor(): Promise<MultiMatchExtractor> {
  return buildMultiMatchExtractor(Actor.getAll, (actor) => [actor.name, ...actor.aliases]);
}

// Returns IDs of extracted actors
export async function extractActors(str: string): Promise<string[]> {
  return (await buildActorExtractor())(str);
}

/**
 * Builds an extractor that sorts the matched items for the string,
 * by name length, so that the match with the longest name will be at the top
 * of the array
 * (not necessarily the item that matched across the longest part of the string)
 *
 * @param getAll - retrieves all the items of that type
 * @param getItemInputs - retrieves the inputs to match an item with
 */
async function buildBestMatchExtractor<T extends MatchSource & { name: string }>(
  getAll: () => Promise<T[]>,
  getItemInputs: (item: T) => string[]
): Promise<BestMatchExtractor> {
  const allItems = await getAll();

  return (str: string) => {
    return getMatcher()
      .filterMatchingItems(allItems, str, getItemInputs)
      .sort((a, b) => b.name.length - a.name.length)
      .map((s) => s._id)[0];
  };
}

export async function buildStudioExtractor(): Promise<BestMatchExtractor> {
  return await buildBestMatchExtractor(Studio.getAll, (studio) => [
    studio.name,
    ...(studio.aliases || []),
  ]);
}

// Returns IDs of extracted studios
export async function extractStudio(str: string): Promise<string | undefined> {
  return (await buildStudioExtractor())(str);
}

export async function buildSceneExtractor(): Promise<BestMatchExtractor> {
  return await buildBestMatchExtractor(Scene.getAll, (scene) => [scene.name]);
}

// Returns IDs of extracted scenes
export async function extractScene(str: string): Promise<string | undefined> {
  return (await buildSceneExtractor())(str);
}

export async function buildMovieExtractor(): Promise<BestMatchExtractor> {
  return buildBestMatchExtractor(Movie.getAll, (movie) => [movie.name]);
}

// Returns IDs of extracted movies
export async function extractMovie(str: string): Promise<string | undefined> {
  return (await buildMovieExtractor())(str);
}
