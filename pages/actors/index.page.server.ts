import type { PageContextBuiltIn } from "vite-plugin-ssr";
import { fetchActors } from "../../composables/use_actor_list";

export async function onBeforeRender(pageContext: PageContextBuiltIn) {
  console.log("render actors");

  const { items: actors, numItems, numPages } = await fetchActors();

  return {
    pageContext: {
      documentProps: {
        title: "Actors"
      },
      pageProps: {
        actors,
        numItems,
        numPages,
      },
    },
  };
}
