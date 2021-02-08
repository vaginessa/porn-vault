import { getClient } from "../search/index";
import Actor from "../types/actor";

export type CustomFieldFilter = {
  id: string;
  op: "gt" | "lt" | "term" | "match" | "wildcard";
  value: unknown;
};

export function buildCustomFilter(filters?: CustomFieldFilter[]): unknown[] {
  if (!filters) {
    return [];
  }

  return filters.map(({ op, id, value }) => {
    if (op === "lt" || op === "gt") {
      return {
        range: {
          [`custom.${id}`]: {
            [op]: value,
          },
        },
      };
    }

    if (op === "wildcard") {
      return {
        wildcard: {
          [`custom.${id}`]: `*${<string>value}*`,
        },
      };
    }

    return {
      [op]: {
        [`custom.${id}`]: value,
      },
    };
  });
}

export const DEFAULT_PAGE_SIZE = 24;

export function searchQuery(query: string | undefined | null, fields: string[]): unknown[] {
  if (query && query.length) {
    return [
      {
        query_string: {
          query: query ? `${query.trim()}*` : "",
          fields,
          fuzziness: "AUTO",
          analyzer: "simple",
          analyze_wildcard: true,
        },
      },
    ];
  }
  return [];
}

export async function getCount(index: string): Promise<number> {
  const { count } = await getClient().count({
    index,
  });
  return count;
}

export function getActorNames(actor: Actor): string[] {
  return [...new Set([actor.name, ...normalizeAliases(actor.aliases)])];
}

export function normalizeAliases(aliases: string[]): string[] {
  return aliases.filter((alias) => !alias.startsWith("regex:"));
}

export function durationFilter(min?: number, max?: number): unknown[] {
  if (min || max) {
    return [
      {
        range: {
          duration: {
            lte: max || 99999999,
            gte: min || 0,
          },
        },
      },
    ];
  }
  return [];
}

export function ratingFilter(rating?: number): unknown[] {
  if (rating && rating > 0) {
    return [
      {
        range: {
          rating: {
            gte: rating || 0,
          },
        },
      },
    ];
  }
  return [];
}

export function favorite(favorite?: boolean): unknown[] {
  if (favorite) {
    return [
      {
        term: { favorite: true },
      },
    ];
  }
  return [];
}

export function bookmark(bookmark?: boolean): unknown[] {
  if (bookmark) {
    return [
      {
        exists: {
          field: "bookmark",
        },
      },
    ];
  }
  return [];
}

export function arrayFilter(ids: string[] | undefined, prop: string, op: "AND" | "OR"): unknown[] {
  if (ids && ids.length) {
    return [
      {
        query_string: {
          query: `(${ids.map((name) => `${prop}:${name}`).join(` ${op} `)})`,
        },
      },
    ];
  }
  return [];
}

export function includeFilter(include?: string[]): unknown[] {
  return arrayFilter(include, "labels", "AND");
}

export function excludeFilter(exclude?: string[]): unknown[] {
  return arrayFilter(exclude, "-labels", "AND");
}

export function shuffle<T>(seed: string, sortBy?: string): unknown[] {
  if (sortBy === "$shuffle") {
    return [
      {
        function_score: {
          query: { match_all: {} },
          random_score: {
            seed,
          },
        },
      },
    ];
  }
  return [];
}

export function sort(sortBy?: string, sortDir?: string, query?: string): Record<string, unknown> {
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
