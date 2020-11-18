import { getMatcher, MatchSource } from "./matching/matcher";
import Actor from "./types/actor";
import CustomField from "./types/custom_field";
import Label from "./types/label";
import Movie from "./types/movie";
import Scene from "./types/scene";
import Studio from "./types/studio";

export type Extractor = (str: string) => string[];

/**
 * Builds an extractor for the given items
 *
 * @param getAll - retrieves all the items of that type
 * @param getItemInputs - retrieves the inputs to match an item with
 * @param sortByLongestMatch - if items should be sorted by the longest matched string
 */
async function buildExtractor<T extends MatchSource>(
  getAll: () => Promise<T[]>,
  getItemInputs: (item: T) => string[],
  sortByLongestMatch: boolean
): Promise<Extractor> {
  const allItems = await getAll();

  return (str: string) => {
    return getMatcher()
      .filterMatchingItems(allItems, str, getItemInputs, sortByLongestMatch)
      .map((s) => s._id);
  };
}

export async function buildFieldExtractor(): Promise<Extractor> {
  return buildExtractor(CustomField.getAll, (field) => [field.name], false);
}

// Returns IDs of extracted custom fields
export async function extractFields(str: string): Promise<string[]> {
  return (await buildFieldExtractor())(str);
}

export async function buildLabelExtractor(): Promise<Extractor> {
  return buildExtractor(Label.getAll, (label) => [label.name, ...label.aliases], false);
}

// Returns IDs of extracted labels
export async function extractLabels(str: string): Promise<string[]> {
  return (await buildLabelExtractor())(str);
}

export async function buildActorExtractor(): Promise<Extractor> {
  return buildExtractor(Actor.getAll, (actor) => [actor.name, ...actor.aliases], false);
}

// Returns IDs of extracted actors
export async function extractActors(str: string): Promise<string[]> {
  return (await buildActorExtractor())(str);
}

export async function buildStudioExtractor(): Promise<Extractor> {
  return await buildExtractor(
    Studio.getAll,
    (studio) => [studio.name, ...(studio.aliases || [])],
    true
  );
}

// Returns IDs of extracted studios
export async function extractStudios(str: string): Promise<string[]> {
  return (await buildStudioExtractor())(str);
}

export async function buildSceneExtractor(): Promise<Extractor> {
  return await buildExtractor(Scene.getAll, (scene) => [scene.name], true);
}

// Returns IDs of extracted scenes
export async function extractScenes(str: string): Promise<string[]> {
  return (await buildSceneExtractor())(str);
}

export async function buildMovieExtractor(): Promise<Extractor> {
  return buildExtractor(Movie.getAll, (movie) => [movie.name], true);
}

// Returns IDs of extracted movies
export async function extractMovies(str: string): Promise<string[]> {
  return (await buildMovieExtractor())(str);
}
