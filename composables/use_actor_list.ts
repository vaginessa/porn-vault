import axios from "axios";
import { ref } from "vue";

import { actorCardFragment } from "../fragments/actor";
import { IActor } from "../types/actor";
import { IPaginationResult } from "../types/pagination";

export function useActorList() {
  const actors = ref<IActor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const numItems = ref(-1);
  const numPages = ref(-1);

  /* async function _fetchScenes(page = 0, ) {
    try {
      loading.value = true;
      error.value = null;
      const result = await fetchScenes(page, );
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
  } */

  return {
    actors,
    loading,
    error,
    numItems,
    numPages,
    // fetchScenes: _fetchScenes,
  };
}

export async function fetchActors(page = 0) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
        query($query: ActorSearchQuery!, $seed: String) {
          getActors(query: $query, seed: $seed) {
            items {
              ...ActorCard
            }
            numItems
            numPages
          }
        }
        ${actorCardFragment}
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

  return data.data.getActors as IPaginationResult<IActor>;
}
