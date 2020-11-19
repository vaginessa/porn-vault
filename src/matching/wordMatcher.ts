import path from "path";

import { WordMatcherOptions } from "../config/schema";
import { createObjectSet } from "../utils/misc";
import { stripAccents } from "../utils/string";
import { ignoreSingleNames, isRegex, Matcher, MatchSource, REGEX_PREFIX } from "./matcher";

const NORMALIZED_WORD_SEPARATOR = "-";

const NORMALIZED_GROUP_SEPARATOR = " ";

const lowercase = (str: string): string => str.toLowerCase();

/**
 * Splits the string by upper/lower camelCase
 *
 * @param str
 * @returns the words or null if no camelCase found
 */
const extractUpperLowerCamelCase = (str: string): string[] | null => {
  // PascalCase, with at least two parts (we want PascalCase, not just Pascal)
  if (/^(?:([A-Z][a-z]+)){2,}$/.test(str)) {
    return [...str.matchAll(/([A-Z][a-z]+)/g)].map((match) => match[0]);
  }

  // camelCase
  if (/^[a-z]+(?:[A-Z][a-z]+)+$/.test(str)) {
    const res = [...str.matchAll(/([a-z]+|(?:[A-Z][a-z]+))/g)].map((match) => match[0]);
    return res;
  }

  return null;
};

interface WordMatch {
  matchIndex: number;
  endMatchIndex: number;
  restCompareArr: (string | string[])[];
}

function isWordOrGroupMatch(
  input: string | string[],
  compareWordOrGroup: string | string[]
): boolean {
  return (
    (Array.isArray(input) ? input.join(NORMALIZED_GROUP_SEPARATOR) : input) ===
    (Array.isArray(compareWordOrGroup)
      ? compareWordOrGroup.join(NORMALIZED_GROUP_SEPARATOR)
      : compareWordOrGroup)
  );
}

/**
 *
 * @param input - the word or groups to match
 * @param compareArr - the array of word or groups to match against
 * @param searchAnywhere - if the match has to be precisely the first element of 'compareArr'
 */
function findWordOrGroupMatch(
  input: string | string[],
  compareArr: (string | string[])[],
  searchAnywhere: boolean
): WordMatch | null {
  if (Array.isArray(input)) {
    if (!searchAnywhere) {
      // Match against the first element, whether it be a group or word
      if (isWordOrGroupMatch(input, compareArr[0])) {
        return {
          matchIndex: 0,
          endMatchIndex: 1,
          restCompareArr: compareArr.slice(1),
        };
      }
      return null;
    }

    // Find full word group against a *single* compare group, or a *single* compare word
    // anywhere in compareArr
    const wordMatchIndex = compareArr.findIndex((compareVal) =>
      isWordOrGroupMatch(input, compareVal)
    );
    if (wordMatchIndex !== -1) {
      return {
        matchIndex: wordMatchIndex,
        endMatchIndex: wordMatchIndex + 1,
        restCompareArr: compareArr.slice(wordMatchIndex + 1),
      };
    }

    // Else find match against *multiple* simple words anywhere in compareArr
    const firstValFirstMatchIndex = compareArr.indexOf(input[0]);
    const firstValLastMatchIndex = compareArr.length - [...compareArr].reverse().indexOf(input[0]);
    if (firstValFirstMatchIndex !== -1) {
      for (let i = firstValFirstMatchIndex; i <= firstValLastMatchIndex; i++) {
        const inputMatchesMultipleWords = input.every((inputVal, inputValIdx) => {
          const compareVal = compareArr[i + inputValIdx];
          if (Array.isArray(compareVal)) {
            // We do not want to match against word groups since that was handled before
            return false;
          }
          return inputVal === compareVal;
        });
        if (inputMatchesMultipleWords) {
          return {
            matchIndex: i,
            endMatchIndex: i + input.length,
            restCompareArr: compareArr.slice(i + input.length),
          };
        }
      }
    }

    return null;
  }
  // Else input is just a word
  if (!searchAnywhere) {
    if (isWordOrGroupMatch(input, compareArr[0])) {
      return {
        matchIndex: 0,
        endMatchIndex: 1,
        restCompareArr: compareArr.slice(1),
      };
    }
    return null;
  }

  // Else search single word anywhere
  const matchIndex = compareArr.findIndex((compareVal) => isWordOrGroupMatch(input, compareVal));
  if (matchIndex !== -1) {
    return {
      matchIndex,
      endMatchIndex: matchIndex + 1,
      restCompareArr: compareArr.slice(matchIndex + 1),
    };
  }

  return null;
}

interface MatchResult {
  matchIndex: number;
  endMatchIndex: number;
}

const doesFullGroupMatch = (
  wordsAndGroups: (string | string[])[],
  compareWordsAndGroups: (string | string[])[]
): MatchResult | null => {
  if (wordsAndGroups.length === 0 && compareWordsAndGroups.length === 0) {
    return {
      matchIndex: 0,
      endMatchIndex: 0,
    };
  }

  let startMatch: WordMatch | null = null;
  let currentMatch: WordMatch = {
    matchIndex: 0,
    endMatchIndex: 0,
    restCompareArr: compareWordsAndGroups,
  };

  for (let i = 0; i < wordsAndGroups.length; i++) {
    const isFirstMatch = i === 0;
    const nextMatch = findWordOrGroupMatch(
      wordsAndGroups[i],
      currentMatch.restCompareArr,
      isFirstMatch
    );
    if (!nextMatch) {
      return null;
    }
    // Since the nextMatch was against a subset of of the main array, add the previous indices
    nextMatch.matchIndex += currentMatch.matchIndex;
    nextMatch.endMatchIndex += currentMatch.endMatchIndex;

    currentMatch = nextMatch;
    if (isFirstMatch) {
      startMatch = currentMatch;
    }
  }

  const matchIndex = startMatch?.matchIndex ?? 0;
  const endMatchIndex = currentMatch.endMatchIndex;

  return {
    matchIndex,
    endMatchIndex,
  };
};

interface SourceInputMatch<T extends MatchSource> {
  source: T;
  sourceId: string;
  matchResult: MatchResult;
}

/**
 * Filters the matches to return only the inputs that do not overlap,
 * or when overlapping, the one with the preferred length
 *
 * @param matches - the matches to filter
 * @param overlappingMatchPreference - which match to return, when overlaps
 */
const filterOverlappingInputMatches = function <T extends MatchSource>(
  matches: SourceInputMatch<T>[],
  overlappingMatchPreference: WordMatcherOptions["overlappingMatchPreference"]
): SourceInputMatch<T>[] {
  if (!overlappingMatchPreference || overlappingMatchPreference === "all") {
    return matches;
  }

  const filteredMatches: SourceInputMatch<T>[] = [];

  matches.forEach((match) => {
    const overlappingMatchIndex = filteredMatches.findIndex((prevMatch) => {
      if (prevMatch.sourceId === match.sourceId) {
        return false;
      }

      const startOverlaps =
        match.matchResult.matchIndex >= prevMatch.matchResult.matchIndex &&
        match.matchResult.matchIndex < prevMatch.matchResult.endMatchIndex;
      const endOverlaps =
        match.matchResult.endMatchIndex > prevMatch.matchResult.matchIndex &&
        match.matchResult.endMatchIndex <= prevMatch.matchResult.endMatchIndex;
      const isOverlap =
        match.matchResult.matchIndex < prevMatch.matchResult.endMatchIndex &&
        match.matchResult.endMatchIndex > prevMatch.matchResult.matchIndex;

      return startOverlaps || endOverlaps || isOverlap;
    });

    if (overlappingMatchIndex === -1) {
      filteredMatches.push(match);
    } else {
      const overlapMatch = filteredMatches[overlappingMatchIndex];
      const lengthDiff = overlapMatch.source.name.length - match.source.name.length;

      if (
        (overlappingMatchPreference === "longest" && lengthDiff < 0) ||
        (overlappingMatchPreference === "shortest" && lengthDiff > 0)
      ) {
        // Remove the match with who we are overlapping, replace with current
        filteredMatches.splice(overlappingMatchIndex, 1, match);
      }
    }
  });

  return filteredMatches;
};

export class WordMatcher implements Matcher {
  private options: WordMatcherOptions;
  private filenameSeparatorRegex: RegExp;

  constructor(options: WordMatcherOptions) {
    this.options = options;
    this.filenameSeparatorRegex = new RegExp(this.options.filepathSeparators.join("|"), "g");
  }

  /**
   * Splits the string into words and groups of words
   *
   * @param str - the string to split
   * @param opts - options
   * @param opts.requireGroup - if there are no groups, if should return all the words found as a group
   */
  private splitWords(
    str: string,
    { requireGroup }: { requireGroup: boolean }
  ): (string | string[])[] {
    let groupSeparators: string[];
    let wordSeparators: string[];

    const hasGroupSep = this.options.groupSeparators.some((sep) => new RegExp(sep).test(str));
    const hasWordSep = this.options.wordSeparators.some((sep) => new RegExp(sep).test(str));
    if (
      !this.options.enableWordGroups ||
      (this.options.wordSeparatorFallback && !hasGroupSep && hasWordSep)
    ) {
      // If word grouping is disabled, or if there are only word separators, use them as the group separators instead
      groupSeparators = [...this.options.groupSeparators, ...this.options.wordSeparators];
      wordSeparators = [];
    } else {
      groupSeparators = [...this.options.groupSeparators];
      wordSeparators = [...this.options.wordSeparators];
    }

    const groupSeparatorStr = groupSeparators.length ? groupSeparators.join("|") : null;
    const wordSeparatorStr = wordSeparators.length ? wordSeparators.join("|") : null;

    const cleanStr = str
      // replace all word separators with a single normalized separator
      .replace(
        wordSeparatorStr ? new RegExp(`${wordSeparatorStr}{1,}`, "g") : "",
        NORMALIZED_WORD_SEPARATOR
      )
      // replace all group separators with a single normalized separator
      .replace(
        groupSeparatorStr ? new RegExp(`${groupSeparatorStr}{1,}`, "g") : "",
        NORMALIZED_GROUP_SEPARATOR
      );

    const simpleGroups = groupSeparatorStr
      ? cleanStr
          .split(NORMALIZED_GROUP_SEPARATOR)
          // remove empty strings
          .filter(Boolean)
      : [cleanStr];

    const groups = simpleGroups
      .map((part) => {
        if (part.includes(NORMALIZED_WORD_SEPARATOR)) {
          // If the part includes a normalized alt separator, we should return it
          // as an array of words
          return part
            .split(NORMALIZED_WORD_SEPARATOR)
            .flatMap((part) => {
              if (this.options.camelCaseWordGroups) {
                return extractUpperLowerCamelCase(part) ?? [part];
              }
              return [part];
            })
            .filter(Boolean)
            .map(lowercase);
        }
        // Otherwise it a camelCase word, or just a simple word

        if (this.options.camelCaseWordGroups) {
          return extractUpperLowerCamelCase(part)?.map(lowercase) ?? lowercase(part);
        }

        return lowercase(part);
      })
      .filter(Boolean);

    if (!this.options.enableWordGroups && groups.some(Array.isArray)) {
      const flatGroups = (groups as string[][]).flat();
      return flatGroups;
    }

    // If requireGroup and there are only words and no groups, wrap the words in a group
    if (requireGroup && groups.length && !groups.some(Array.isArray)) {
      return [groups as string[]];
    }

    return groups;
  }

  public filterMatchingItems<T extends MatchSource>(
    itemsToMatch: T[],
    filePath: string,
    getInputs: (matchSource: T) => string[],
    sortByLongestMatch?: boolean
  ): T[] {
    let pathWithoutExt = this.options.ignoreDiacritics ? stripAccents(filePath) : filePath;
    const pathExtension = path.extname(filePath);
    if (pathExtension) {
      pathWithoutExt = pathWithoutExt.replace(new RegExp(`${pathExtension}$`), "");
    }

    const pathParts = [...pathWithoutExt.split(this.filenameSeparatorRegex), pathExtension].filter(
      Boolean
    );
    const pathGroups = pathParts.map((testGroup) =>
      this.splitWords(testGroup, {
        requireGroup: false,
      })
    );

    const regexSourceResults: SourceInputMatch<T>[] = [];
    const groupSourceResults: SourceInputMatch<T>[][] = new Array(pathGroups.length)
      .fill(0)
      .map(() => []);

    itemsToMatch.forEach((source) => {
      const inputs = getInputs(source);
      const filteredInputs = this.options.ignoreSingleNames ? ignoreSingleNames(inputs) : inputs;

      filteredInputs.forEach((input) => {
        // Match regex against whole path
        if (isRegex(input)) {
          const inputRegex = new RegExp(input.replace(REGEX_PREFIX, ""), "i");
          const res = inputRegex.exec(filePath);
          if (res) {
            regexSourceResults.push({
              source,
              sourceId: source._id,
              matchResult: {
                matchIndex: res.index,
                endMatchIndex: inputRegex.lastIndex,
              },
            });
          }
          return;
        }

        // Else match against individual path groups
        const cleanInput = this.options.ignoreDiacritics ? stripAccents(input) : input;
        const inputGroups = this.splitWords(cleanInput, {
          requireGroup: true,
        });

        pathGroups.forEach((pathGroup, pathGroupIdx) => {
          const matchResult = doesFullGroupMatch(inputGroups, pathGroup);

          if (matchResult) {
            groupSourceResults[pathGroupIdx].push({
              source,
              sourceId: source._id,
              matchResult: {
                ...matchResult,
                matchIndex: matchResult.matchIndex + pathGroupIdx,
                endMatchIndex: matchResult.endMatchIndex + pathGroupIdx,
              },
            });
          }
        });
      });
    });

    const noOverlapItems = [
      ...filterOverlappingInputMatches(regexSourceResults, this.options.overlappingMatchPreference),
      ...groupSourceResults
        .map((groupResults) =>
          filterOverlappingInputMatches(groupResults, this.options.overlappingMatchPreference)
        )
        .flat(),
    ];
    if (sortByLongestMatch) {
      noOverlapItems.sort((a, b) => b.source.name.length - a.source.name.length);
    }

    // Get unique sources since a source's inputs can be matched in different path groups and regex
    // Keep the first item for an id in case we sorted the longest matches to the top
    return createObjectSet(noOverlapItems, "sourceId", "first").map((match) => match.source);
  }

  isMatchingItem<T extends MatchSource>(
    item: T,
    str: string,
    getInputs: (matchSource: T) => string[]
  ): boolean {
    return !!this.filterMatchingItems([item], str, getInputs).length;
  }
}
