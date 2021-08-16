import axios from "axios";

import { getUrl } from "../util/url";
import { imageCardFragment } from "./fragments";
import { IPaginationResult } from "../types/pagination";
import { IImage } from "../types/image";

export async function fetchImages(isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
    {
      query: `
        query($query: ImageSearchQuery!, $seed: String) {
          getImages(query: $query, seed: $seed) {
            items {
              ...ImageCard
            }
            numItems
            numPages
          }
        }
        ${imageCardFragment}
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

  return data.data.getImages as IPaginationResult<IImage>;
}
