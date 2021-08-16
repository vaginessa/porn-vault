import axios from "axios";

import { getUrl } from "../util/url";
import { studioCardFragment } from "./fragments";
import { IPaginationResult } from "../types/pagination";
import { IStudio } from "../types/studio";

export async function fetchStudios(isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
    {
      query: `
        query($query: StudioSearchQuery!, $seed: String) {
          getStudios(query: $query, seed: $seed) {
            items {
              ...StudioCard
            }
            numItems
            numPages
          }
        }
        ${studioCardFragment}
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

  return data.data.getStudios as IPaginationResult<IStudio>;
}
