import { getConfig } from "../config";
import { StringMatcherOptions, WordMatcherOptions } from "../config/schema";
import { StringMatcher } from "./stringMatcher";
import { WordMatcher } from "./wordMatcher";

export interface MatchSource {
  _id: string;
}

export type GetSourceInputs = <T extends MatchSource>(matchSource: T) => string[];

export interface Matcher {
  filterMatchingItems: <T extends MatchSource>(
    itemsToMatch: T[],
    str: string,
    getInputs: (matchSource: T) => string[]
  ) => T[];

  isMatchingItem: <T extends MatchSource>(
    item: T,
    str: string,
    getInputs: (matchSource: T) => string[]
  ) => boolean;
}

export const REGEX_PREFIX = "regex:";

export function isRegex(str: string): boolean {
  return str.startsWith("regex:");
}

export const getMatcher = (): Matcher => {
  const config = getConfig();
  const matcherType = config.matching.matcher.type;
  const matcherOptions = config.matching.matcher.options;

  switch (matcherType) {
    case "legacy":
      return new StringMatcher(matcherOptions as StringMatcherOptions);
    case "word":
      return new WordMatcher(matcherOptions as WordMatcherOptions);
    default:
      throw new Error(`Could not find matcher specified by config: "${matcherType as string}"`);
  }
};

export function isSingleWord(str: string): boolean {
  return str.split(" ").length === 1;
}

export function ignoreSingleNames(arr: string[], ignoreSingleNames: boolean): string[] {
  if (!ignoreSingleNames) {
    return arr;
  }

  return arr.filter((str) => {
    if (!str.length) {
      return false;
    }

    // Check if string is a viable name
    if (!isRegex(str)) {
      return !isSingleWord(str); // Cut it out if it's just one name
    }
    // Otherwise, it's a regex, so leave it be
    return true;
  });
}
