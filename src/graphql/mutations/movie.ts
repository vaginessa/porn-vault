import { database } from "../../database";
import Movie from "../../types/movie";
import { Dictionary } from "../../types/utility";

export default {
  addMovie(_, args: Dictionary<any>) {
    const movie = new Movie(args.name, args.scenes);

    database
      .get("movies")
      .push(movie)
      .write();

    return movie;
  },

  removeMovies(_, { ids }: { ids: string[] }) {
    for (const id of ids) {
      const movie = Movie.getById(id);

      if (movie) {
        Movie.remove(movie.id);
        return true;
      }
    }
  },

  addScenesToMovie(_, { id, scenes }: { id: string; scenes: string[] }) {
    const movie = Movie.getById(id);

    if (movie) {
      if (Array.isArray(scenes)) movie.scenes.push(...scenes);

      movie.scenes = [...new Set(movie.scenes)];

      database
        .get("movies")
        .find({ id: movie.id })
        .assign(movie)
        .write();

      return movie;
    } else {
      throw new Error(`Movie ${id} not found`);
    }
  }
};
