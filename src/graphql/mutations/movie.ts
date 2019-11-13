import { database } from "../../database";
import Movie from "../../types/movie";
import { Dictionary } from "../../types/utility";

type IMovieUpdateOpts = Partial<{
  name: string;
  description: string;
  releaseDate: number;
  frontCover: string;
  backCover: string;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
  scenes: string[];
}>;

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
  },

  updateMovies(_, { ids, opts }: { ids: string[]; opts: IMovieUpdateOpts }) {
    const updatedScenes = [] as Movie[];

    for (const id of ids) {
      const movie = Movie.getById(id);

      if (movie) {
        if (typeof opts.name == "string") movie.name = opts.name;

        if (typeof opts.description == "string")
          movie.description = opts.description;

        if (typeof opts.backCover == "string") movie.backCover = opts.backCover;

        if (typeof opts.frontCover == "string")
          movie.frontCover = opts.frontCover;

        if (Array.isArray(opts.scenes)) movie.scenes = opts.scenes;

        if (typeof opts.bookmark == "boolean") movie.bookmark = opts.bookmark;

        if (typeof opts.favorite == "boolean") movie.favorite = opts.favorite;

        if (typeof opts.rating == "number") movie.rating = opts.rating;

        if (typeof opts.releaseDate == "number")
          movie.releaseDate = opts.releaseDate;

        database
          .get("movies")
          .find({ id: movie.id })
          .assign(movie)
          .write();

        updatedScenes.push(movie);
      }
    }

    return updatedScenes;
  }
};
