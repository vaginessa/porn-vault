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
    getInputs: (matchSource: T) => string[]
  ): T[] {
    const cleanStr = stripStr(str);
    // logger.log(`Checking if ${item.name} matches ${str}`);

    return itemsToMatch.filter((source) => {
      const inputs = getInputs(source);
      const filteredInputs = ignoreSingleNames(inputs, this.options.ignoreSingleNames);

      return filteredInputs.some((input) => {
        if (isRegex(input)) {
          logger.log(`Regex: "${input}"`);
          return new RegExp(input.replace(REGEX_PREFIX, ""), "i").test(cleanStr);
        }

        return cleanStr.includes(stripStr(input));
      });
    });
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
