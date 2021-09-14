import axios from "axios";
import { ref } from "@nuxtjs/composition-api";

import { getUrl } from "../util/url";
import { sceneCardFragment } from "./fragments";
import { IPaginationResult } from "../types/pagination";
import { IScene } from "../types/scene";

export function useSceneList() {
  const scenes = ref<IScene[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const numItems = ref(-1);
  const numPages = ref(-1);

  async function _fetchScenes(page = 0, isServer: boolean) {
    try {
      loading.value = true;
      error.value = null;
      const result = await fetchScenes(page, isServer);
      scenes.value = result.items;
      numItems.value = result.numItems;
      numPages.value = result.numPages;
    } catch (fetchError) {
      if (!fetchError.response) {
        error.value = fetchError.message;
      } else {
        error.value = fetchError.message;
      }
    }
    loading.value = false;
  }

  return {
    scenes,
    loading,
    error,
    numItems,
    numPages,
    fetchScenes: _fetchScenes,
  };
}

export async function fetchScenes(page = 0, isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
    {
      query: `
        query($query: SceneSearchQuery!, $seed: String) {
          getScenes(query: $query, seed: $seed) {
            items {
              ...SceneCard
            }
            numItems
            numPages
          }
        }
        ${sceneCardFragment}
      `,
      variables: {
        query: {
          query: "",
          page,
          sortBy: "addedOn",
          sortDir: "desc",
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return data.data.getScenes as IPaginationResult<IScene>;
}
