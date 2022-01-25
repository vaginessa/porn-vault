import axios from "axios";

import { movieCardFragment } from "../fragments/movie";
import { IPaginationResult } from "../types/pagination";
import { IMovie } from "../types/movie";

export async function fetchMovies(isServer: boolean) {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
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

