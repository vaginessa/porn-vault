import axios from "axios";

import { movieCardFragment } from "../fragments/movie";
import { IPaginationResult } from "../types/pagination";
import { IMovie } from "../types/movie";
import { useState } from "react";
import { gqlIp } from "../util/ip";

export function useMovieList(initial: IPaginationResult<IMovie>, query: any) {
  const [movies, setMovies] = useState<IMovie[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems || -1);
  const [numPages, setNumPages] = useState(initial?.numPages || -1);

  async function _fetchMovies(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchMovies(page, query);
      setMovies(result.items);
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
    movies,
    loading,
    error,
    numItems,
    numPages,
    fetchMovies: _fetchMovies,
  };
}

export async function fetchMovies(page = 0, query: any) {
  const { data } = await axios.post(
    gqlIp(),
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

  return data.data.getMovies as IPaginationResult<IMovie>;
}
