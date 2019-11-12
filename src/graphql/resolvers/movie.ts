import Movie from "../../types/movie";
import Image from "../../types/image";

export default {
  frontCover(movie: Movie) {
    if (movie.frontCover) return Image.getById(movie.frontCover);
    return null;
  },

  backCover(movie: Movie) {
    if (movie.backCover) return Image.getById(movie.backCover);
    return null;
  },

  scenes(movie: Movie) {
    return Movie.getScenes(movie);
  }
};
