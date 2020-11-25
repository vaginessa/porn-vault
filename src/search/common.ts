export const DEFAULT_PAGE_SIZE = 24;

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
