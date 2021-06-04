import axios from "axios";

import { getUrl } from "../util/url";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";

export async function fetchActors(isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
    {
      query: `
        query($query: ActorSearchQuery!, $seed: String) {
          getActors(query: $query, seed: $seed) {
            items {
              _id
              name
              age
              rating
              favorite
              bookmark
              thumbnail {
                _id
                color
              }
              labels {
                _id
                name
                color
              }
            }
            numItems
            numPages
          }
        }
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
