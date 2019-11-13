import Actor from "../../types/actor";
import Label from "../../types/label";
import Scene from "../../types/scene";
import Image from "../../types/image";
import Movie from "../../types/movie";

interface HashMap<T> {
  [key: string]: T;
}

type AnyMap = HashMap<any>;

export default {
  getImages() {
    return Image.getAll();
  },

  getSceneById(_, args: AnyMap) {
    return Scene.getById(args.id);
  },
  getScenes() {
    return Scene.getAll();
  },

  getActorById(_, args: AnyMap) {
    return Actor.getById(args.id);
  },
  getActors() {
    return Actor.getAll();
  },
  findActors(_, args: AnyMap) {
    return Actor.find(args.name);
  },

  getLabelById(_, args: AnyMap) {
    return Label.getById(args.id);
  },
  getLabels() {
    return Label.getAll().sort((a, b) => a.name.localeCompare(b.name));
  },
  findLabel(_, args: AnyMap) {
    return Label.find(args.name);
  },

  getMovies() {
    return Movie.getAll();
  }
};
