import { StringMatcherOptions } from "../config/schema";
import * as logger from "../utils/logger";
import { ignoreSingleNames, isRegex, Matcher, MatchSource, REGEX_PREFIX } from "./matcher";

export function stripStr(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9'/\\,()[\]{}-]/g, "");
}

export class StringMatcher implements Matcher {
  private options: StringMatcherOptions;

  constructor(options: StringMatcherOptions) {
    this.options = options;
  }

  filterMatchingItems<T extends MatchSource>(
    itemsToMatch: T[],
    str: string,
    getInputs: (matchSource: T) => string[],
    sortByLongestMatch?: boolean
  ): T[] {
    const cleanStr = stripStr(str);
    // logger.log(`Checking if ${item.name} matches ${str}`);

    const matches = itemsToMatch.filter((source) => {
      const inputs = getInputs(source);
      const filteredInputs = this.options.ignoreSingleNames ? ignoreSingleNames(inputs) : inputs;

      for (const input of filteredInputs) {
        if (isRegex(input)) {
          logger.log(`Regex: "${input}"`);
          const isMatch = new RegExp(input.replace(REGEX_PREFIX, ""), "i").test(cleanStr);
          if (isMatch) {
            return true;
          }
        } else {
          const cleanInput = stripStr(input);
          const matchIndex = cleanStr.indexOf(cleanInput);

          if (matchIndex !== -1) {
            return true;
          }
        }
      }
    });

    if (sortByLongestMatch) {
      matches.sort((a, b) => b.name.length - a.name.length);
    }

    return matches;
  }

  isMatchingItem<T extends MatchSource>(
    item: T,
    str: string,
    getInputs: (matchSource: T) => string[]
  ): boolean {
    const res = this.filterMatchingItems([item], str, getInputs);
    return !!res.length;
  }
}
