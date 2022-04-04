import axios from "axios";
import { useState } from "react";

import { actorCardFragment } from "../fragments/actor";
import { IActor } from "../types/actor";
import { IPaginationResult } from "../types/pagination";
import { gqlIp } from "../util/ip";

export function useActorList(initial: IPaginationResult<IActor>, query: any) {
  const [actors, setActors] = useState<IActor[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems || -1);
  const [numPages, setNumPages] = useState(initial?.numPages || -1);

  async function _fetchActors(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchActors(page, query);
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

export async function fetchActors(page = 0, query: any) {
  const { data } = await axios.post(
    gqlIp(),
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

  return data.data.getActors as IPaginationResult<IActor>;
}
