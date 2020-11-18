import { StringMatcherOptions } from "../config/schema";
import * as logger from "../utils/logger";
import { ignoreSingleNames, isRegex, Matcher, MatchSource, REGEX_PREFIX } from "./matcher";

export function stripStr(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9'/\\,()[\]{}-]/g, "");
}

interface Match {
  matchedSourceId: string;
  sourceName: string;
  matchIndex: number;
  endMatchIndex: number;
  matchedStr: string;
}

const matchSorter = (a: Match, b: Match): number =>
  b.matchedStr.length - b.matchedStr.length || b.sourceName.length - a.sourceName.length;

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

    const matches: Match[] = [];

    itemsToMatch.forEach((source) => {
      const sourceMatches: Match[] = [];

      const inputs = getInputs(source);
      const filteredInputs = this.options.ignoreSingleNames ? ignoreSingleNames(inputs) : inputs;

      filteredInputs.forEach((input) => {
        if (isRegex(input)) {
          logger.log(`Regex: "${input}"`);
          const inputRegex = new RegExp(input.replace(REGEX_PREFIX, ""), "i");
          const execRes = inputRegex.exec(cleanStr);
          if (!execRes) {
            return;
          }

          sourceMatches.push({
            matchedSourceId: source._id,
            sourceName: source.name,
            matchIndex: execRes.index,
            endMatchIndex: inputRegex.lastIndex,
            matchedStr: cleanStr.substring(execRes.index, inputRegex.lastIndex),
          });
        }

        const cleanInput = stripStr(input);
        const matchIndex = cleanStr.indexOf(cleanInput);

        if (matchIndex !== -1) {
          sourceMatches.push({
            matchedSourceId: source._id,
            sourceName: source.name,
            matchIndex,
            endMatchIndex: matchIndex + cleanInput.length,
            matchedStr: cleanInput,
          });
        }
      });

      const longestMatch = sourceMatches.sort(matchSorter)[0];
      if (longestMatch) {
        // Only push a single match per source
        matches.push(longestMatch);
      }
    });

    if (sortByLongestMatch) {
      matches.sort(matchSorter);
    }

    return matches.map(
      (match) => itemsToMatch.find((item) => item._id === match.matchedSourceId) as T
    );
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
