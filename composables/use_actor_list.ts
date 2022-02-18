import axios from "axios";
import { useState } from "react";

import { actorCardFragment } from "../fragments/actor";
import { IActor } from "../types/actor";
import { IPaginationResult } from "../types/pagination";

export function useActorList() {
  const [actors, setActors] = useState<IActor[]>([]);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(-1);
  const [numPages, setNumPages] = useState(-1);

  async function _fetchActors(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchActors(page);
      setActors(result.items);
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
    actors,
    loading,
    error,
    numItems,
    numPages,
    fetchActors: _fetchActors,
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
