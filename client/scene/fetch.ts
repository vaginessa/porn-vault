import axios from "axios";

import { getUrl } from "../util/url";
import { sceneCardFragment } from "../fragments/scene";
import { IPaginationResult } from "../types/pagination";
import { IScene } from "../types/scene";

export async function fetchScenes(isServer: boolean) {
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
          page: 0,
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
