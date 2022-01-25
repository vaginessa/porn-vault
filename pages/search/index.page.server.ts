import type { PageContextBuiltIn } from "vite-plugin-ssr";
import axios from "axios";

import {sceneCardFragment} from "../../fragments/scene"
import {movieCardFragment} from "../../fragments/movie"

async function searchAll(query: string) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
        query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!, $mo: MovieSearchQuery!) {
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
          getMovies(query: $mo) {
            items {
              ...MovieCard
            }
            numItems
          }
        }

        ${sceneCardFragment}
        ${movieCardFragment}
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
    actorResult: data.data.getActors,
    movieResult: data.data.getMovies,
  };
}

export async function onBeforeRender(pageContext: PageContextBuiltIn) {
  const q = pageContext.urlParsed.search.q;
  const result = await searchAll(q || "");

  return {
    pageContext: {
      documentProps: {
        title: q ? `Search results for '${q}'` : "Search results",
      },
      pageProps: {
        ...result
      },
    },
  };
}
