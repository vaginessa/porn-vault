import { getMatcher } from "./matching/matcher";
import Actor from "./types/actor";
import CustomField from "./types/custom_field";
import Label from "./types/label";
import Movie from "./types/movie";
import Scene from "./types/scene";
import Studio from "./types/studio";

// Returns IDs of extracted custom fields
export async function extractFields(str: string): Promise<string[]> {
  const allFields = await CustomField.getAll();

  return getMatcher()
    .filterMatchingItems(allFields, str, (field) => [field.name])
    .map((s) => s._id);
}

// Returns IDs of extracted labels
export async function extractLabels(str: string): Promise<string[]> {
  const allLabels = await Label.getAll();

  return getMatcher()
    .filterMatchingItems(allLabels, str, (label) => [label.name, ...label.aliases])
    .map((s) => s._id);
}

// Returns IDs of extracted actors
export async function extractActors(str: string): Promise<string[]> {
  const allActors = await Actor.getAll();

  return getMatcher()
    .filterMatchingItems(allActors, str, (actor) => [actor.name, ...actor.aliases])
    .map((s) => s._id);
}

// Returns IDs of extracted studios
export async function extractStudios(str: string): Promise<string[]> {
  const allStudios = await Studio.getAll();
  return getMatcher()
    .filterMatchingItems(allStudios, str, (studio) => [studio.name, ...(studio.aliases || [])])
    .sort((a, b) => b.name.length - a.name.length)
    .map((s) => s._id);
}

// Returns IDs of extracted scenes
export async function extractScenes(str: string): Promise<string[]> {
  const allScenes = await Scene.getAll();
  return getMatcher()
    .filterMatchingItems(allScenes, str, (scene) => [scene.name])
    .sort((a, b) => b.name.length - a.name.length)
    .map((s) => s._id);
}

// Returns IDs of extracted movies
export async function extractMovies(str: string): Promise<string[]> {
  const allMovies = await Movie.getAll();
  return getMatcher()
    .filterMatchingItems(allMovies, str, (movie) => [movie.name])
    .sort((a, b) => b.name.length - a.name.length)
    .map((s) => s._id);
}
