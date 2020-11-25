export const DEFAULT_PAGE_SIZE = 24;

export function shuffle(seed: string, sortBy?: string) {
  if (sortBy === "$shuffle") {
    return {
      function_score: {
        query: { match_all: {} },
        random_score: {
          seed,
        },
      },
    };
  }
  return {};
}

export function sort(sortBy?: string, sortDir?: string, query?: string) {
  if (sortBy === "$shuffle") {
    return {};
  }
  if (sortBy === "relevance" && !query) {
    return {
      sort: { addedOn: "desc" },
    };
  }
  if (sortBy && sortBy !== "relevance") {
    return {
      sort: {
        [sortBy]: sortDir || "desc",
      },
    };
  }
  return {};
}

export interface ISearchResults {
  items: string[];
  total: number;
  numPages: number;
}

export function getPageSize(take?: number): number {
  return take || DEFAULT_PAGE_SIZE;
}

export function getPage(
  page?: number,
  skip?: number,
  take?: number
): { from: number; size: number } {
  const pageSize = getPageSize(take);
  return {
    from: skip || Math.max(0, +(page || 0) * pageSize),
    size: pageSize,
  };
}
