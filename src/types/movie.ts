import { database } from "../database";
import { generateHash } from "../hash";
import Scene from "./scene";

export default class Movie {
  id: string;
  name: string;
  addedOn = +new Date();
  releaseDate: string | null = null;
  frontCover: string | null = null;
  backCover: string | null = null;
  favorite: boolean = false;
  bookmark: boolean = false;
  rating: number = 0;
  scenes: string[] = [];

  static filterImage(image: string) {
    for (const movie of Movie.getAll()) {
      database
        .get("movies")
        .find({ id: movie.id, frontCover: image })
        .assign({ frontCover: null })
        .write();

      database
        .get("movies")
        .find({ id: movie.id, backCover: image })
        .assign({ backCover: null })
        .write();
    }
  }

  static remove(id: string) {
    database
      .get("movies")
      .remove({ id })
      .write();
  }

  static getById(id: string): Movie | null {
    return Movie.getAll().find(movie => movie.id == id) || null;
  }

  static getAll(): Movie[] {
    return database.get("movies").value();
  }

  static getScenes(movie: Movie) {
    return movie.scenes.map(Scene.getById).filter(Boolean) as Scene[];
  }

  constructor(name: string, scenes: string[] = []) {
    this.id = generateHash();
    this.name = name.trim();
    this.scenes = scenes;
  }
}
