import type { PageContextBuiltIn } from "vite-plugin-ssr";
import { fetchMovies } from "../../composables/use_movie_list";

export async function onBeforeRender(pageContext: PageContextBuiltIn) {
  console.log("render movies");

  const { items: movies, numItems, numPages } = await fetchMovies();

  return {
    pageContext: {
      documentProps: {
        title: "Movies"
      },
      pageProps: {
        movies,
        numItems,
        numPages,
      },
    },
  };
}
