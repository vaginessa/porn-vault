import { Gianna } from "./internal";

const PAGE_SIZE = 24;

export function calculateTake(take?: number): number {
  return take || PAGE_SIZE;
}

export function calculateSkip(skip?: number, page?: number, take?: number): number {
  return skip || (page || 0) * (take || PAGE_SIZE) || 0;
}

export function filterDuration(
  filter: Gianna.IFilterTreeGrouping,
  options: { durationMin?: number | null; durationMax?: number | null }
): void {
  if (options.durationMin) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "duration",
        type: "number",
        value: options.durationMin - 1,
      },
    });
  }

  if (options.durationMax) {
    filter.children.push({
      condition: {
        operation: "<",
        property: "duration",
        type: "number",
        value: options.durationMax + 1,
      },
    });
  }
}

export function filterFavorites(
  filter: Gianna.IFilterTreeGrouping,
  options: { favorite?: boolean }
): void {
  if (options.favorite) {
    filter.children.push({
      condition: {
        operation: "=",
        property: "favorite",
        type: "boolean",
        value: true,
      },
    });
  }
}

export function filterBookmark(
  filter: Gianna.IFilterTreeGrouping,
  options: { bookmark?: boolean }
): void {
  if (options.bookmark) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "bookmark",
        type: "number",
        value: 0,
      },
    });
  }
}

export function filterRating(
  filter: Gianna.IFilterTreeGrouping,
  options: { rating?: number }
): void {
  if (options.rating) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "rating",
        type: "number",
        value: options.rating - 1,
      },
    });
  }
}

export function filterInclude(
  filter: Gianna.IFilterTreeGrouping,
  options: { include?: string[] }
): void {
  if (options.include && options.include.length) {
    filter.children.push({
      type: "AND",
      children: options.include.map((labelId) => ({
        condition: {
          operation: "?",
          property: "labels",
          type: "array",
          value: labelId,
        },
      })),
    });
  }
}

export function filterExclude(
  filter: Gianna.IFilterTreeGrouping,
  options: { exclude?: string[] }
): void {
  if (options.exclude && options.exclude.length) {
    filter.children.push({
      type: "AND",
      children: options.exclude.map((labelId) => ({
        type: "NOT",
        children: [
          {
            condition: {
              operation: "?",
              property: "labels",
              type: "array",
              value: labelId,
            },
          },
        ],
      })),
    });
  }
}

export function filterActors(
  filter: Gianna.IFilterTreeGrouping,
  options: { actors?: string[] }
): void {
  if (options.actors && options.actors.length) {
    filter.children.push({
      type: "AND",
      children: options.actors.map((labelId) => ({
        condition: {
          operation: "?",
          property: "actors",
          type: "array",
          value: labelId,
        },
      })),
    });
  }
}

export function filterStudios(
  filter: Gianna.IFilterTreeGrouping,
  options: { studios?: string[] }
): void {
  if (options.studios && options.studios.length) {
    filter.children.push({
      type: "OR",
      children: options.studios.map((studioId) => ({
        condition: {
          operation: "=",
          property: "studio",
          type: "string",
          value: studioId,
        },
      })),
    });
  }
}
