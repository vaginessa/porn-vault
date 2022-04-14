import axios from "axios";
import { useState } from "react";

import { imageCardFragment } from "../fragments/image";
import { IImage } from "../types/image";
import { IPaginationResult } from "../types/pagination";
import { gqlIp } from "../util/ip";

export function useImageList(initial: IPaginationResult<IImage>, query: any) {
  const [images, setImages] = useState<IImage[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems || -1);
  const [numPages, setNumPages] = useState(initial?.numPages || -1);

  async function _fetchImages(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchImages(page, query);
      setImages(result.items);
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
    images,
    loading,
    error,
    numItems,
    numPages,
    fetchImages: _fetchImages,
  };
}

export async function fetchImages(page = 0, query: any) {
  const { data } = await axios.post(
    gqlIp(),
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

  return data.data.getImages as IPaginationResult<IImage>;
}
