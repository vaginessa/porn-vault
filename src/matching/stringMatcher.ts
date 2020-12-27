import { StringMatcherOptions } from "../config/schema";
import { formatMessage, logger } from "../utils/logger";
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
    logger.verbose(`(String matcher) Filtering ${itemsToMatch.length} items using term "${str}"`);
    const cleanStr = stripStr(str);

    const matches = itemsToMatch.filter((source) => {
      const inputs = getInputs(source);
      const filteredInputs = this.options.ignoreSingleNames ? ignoreSingleNames(inputs) : inputs;

      for (const input of filteredInputs) {
        logger.silly(`(String matcher) Checking if "${input}" matches "${cleanStr}"`);
        if (isRegex(input)) {
          const regex = input.replace(REGEX_PREFIX, "");
          const isMatch = new RegExp(regex, "i").test(cleanStr);
          logger.silly(`(String matcher) Regex: "${regex}", executing regex`);
          if (isMatch) {
            return true;
          }
        } else {
          logger.silly(`(String matcher) Not a regex, doing substring search`);
          const cleanInput = stripStr(input);
          const matchIndex = cleanStr.indexOf(cleanInput);
          logger.silly(`(String matcher) Substring index: ${matchIndex}`);
          return matchIndex !== -1;
        }
      }

      return false;
    });

    if (sortByLongestMatch) {
      logger.debug(`(String matcher) Sorting results by longest match`);
      matches.sort((a, b) => b.name.length - a.name.length);
    }

    logger.verbose(`(String matcher) Matched ${matches.length} items`);
    return matches;
  }

  isMatchingItem<T extends MatchSource>(
    item: T,
    str: string,
    getInputs: (matchSource: T) => string[]
  ): boolean {
    logger.silly(`(String matcher) Checking if ${str} matches item ${formatMessage(item)}`);
    const res = this.filterMatchingItems([item], str, getInputs);
    return !!res.length;
  }
}
