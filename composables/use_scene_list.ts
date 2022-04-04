import axios from "axios";

import { sceneCardFragment } from "../fragments/scene";
import { IScene } from "../types/scene";
import { IPaginationResult } from "../types/pagination";
import { useState } from "react";
import { gqlIp } from "../util/ip";

export function useSceneList(initial: IPaginationResult<IScene>, query: any) {
  const [scenes, setScenes] = useState<IScene[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems || -1);
  const [numPages, setNumPages] = useState(initial?.numPages || -1);

  async function _fetchScenes(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchScenes(page, query);
      setScenes(result.items);
      setNumItems(result.numItems);
      setNumPages(result.numPages);
    } catch (fetchError: any) {
      if (!fetchError.response) {
        setError(fetchError.message);
      } else {
        setError(fetchError.message);
      }
    }
    setLoader(false);
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

export async function fetchScenes(page = 0, query: any) {
  const { data } = await axios.post(
    gqlIp(),
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
          ...query,
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
