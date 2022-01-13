import type { PageContextBuiltIn } from "vite-plugin-ssr";
import { fetchScenes } from "../../composables/use_scene_list";

export async function onBeforeRender(pageContext: PageContextBuiltIn) {
  console.log("render scenes");

  const { items: scenes, numItems, numPages } = await fetchScenes();

  return {
    pageContext: {
      pageProps: {
        scenes,
        numItems,
        numPages,
      },
    },
  };
}
