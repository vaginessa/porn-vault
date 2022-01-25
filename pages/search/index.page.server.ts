import type { PageContextBuiltIn } from "vite-plugin-ssr";
import axios from "axios";
import {sceneCardFragment} from "../../fragments/scene"

async function searchAll(query: string) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
      # TODO: , $mo: MovieSearchQuery!
        query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!) {
          getScenes(query: $sc) {
            items {
              ...SceneCard
            }
            numItems
          }
          getActors(query: $ac) {
            items {
              _id
              name
              thumbnail {
                _id
                color
              }
            }
            numItems
          }
          #getMovies(query: $mo) {
          #  items {
          #    ...MovieCard
          #  }
          #  numItems
          #}
        }

        ${sceneCardFragment}
        # TODO: movie card fragment
      `,
      variables: {
        sc: {
          query,
          take: 10,
        },
        ac: {
          query,
          take: 10,
        },
        mo: {
          query,
          take: 10,
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    sceneResult: data.data.getScenes,
    // actorResult: data.data.getActors,
    // movieResult: data.data.getMovies,
  };
}

export async function onBeforeRender(pageContext: PageContextBuiltIn) {
  const result = await searchAll(pageContext.urlParsed.search.q || "");

  return {
    pageContext: {
      pageProps: {
        ...result
      },
    },
  };
}
