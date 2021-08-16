import axios from "axios";

import { getUrl } from "../util/url";
import { movieCardFragment } from "./fragments";
import { IPaginationResult } from "../types/pagination";
import { IMovie } from "../types/movie";

export async function fetchMovies(isServer: boolean) {
  const { data } = await axios.post(
    getUrl("/api/ql", isServer),
    {
      query: `
        query($query: MovieSearchQuery!, $seed: String) {
          getMovies(query: $query, seed: $seed) {
            items {
              ...MovieCard
            }
            numItems
            numPages
          }
        }
        ${movieCardFragment}
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

  return data.data.getMovies as IPaginationResult<IMovie>;
}
