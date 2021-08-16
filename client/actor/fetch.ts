import axios from "axios";

import { getUrl } from "../util/url";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";
import { actorCardFragment } from "./fragments";

export async function fetchActors(isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
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

  return data.data.getActors as IPaginationResult<IActor>;
}
