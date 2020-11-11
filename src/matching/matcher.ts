export interface MatchSource {
  id: string;
  inputs: string[];
}

export interface Extractor {
  filterMatchingInputs: (matchSources: MatchSource[], path: string) => string[];
}

export const REGEX_PREFIX = "regex:";

export function isRegex(str: string): boolean {
  return str.startsWith("regex:");
}
