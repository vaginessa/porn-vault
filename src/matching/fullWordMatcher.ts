import { Extractor } from "./wordMatcher";

const ALT_SEPARATORS = ["-", "_", ",", "\\."].map((sep) => new RegExp(sep));

const BASIC_SEPARATOR = " ";

const NORMALIZED_ALT_SEPARATOR = "-";

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

/**
 * Splits the string into words and groups of words
 *
 * @param str - the string to split
 * @param opts - options
 * @param opts.requireGroup - if there are no groups, if should return all the words found as a group
 * @param opts.flattenWordGroups - if word groups should be flattened to simple words
 */
const splitWords = (
  str: string,
  { requireGroup, flattenWordGroups }: { requireGroup: boolean; flattenWordGroups: boolean }
): (string | string[])[] => {
  const useAltSeparatorsAsMainSeparator =
    !str.includes(BASIC_SEPARATOR) && ALT_SEPARATORS.some((sep) => sep.test(str));

  const groups = str
    // replace all non basic separators with our alternate splitter
    .replace(
      new RegExp(ALT_SEPARATORS.map((sep) => sep.source).join("|"), "g"),
      NORMALIZED_ALT_SEPARATOR
    )
    .replace(/\s+/g, BASIC_SEPARATOR) // replace multiple basic separators with single separator
    .trim()
    .replace(new RegExp(`${NORMALIZED_ALT_SEPARATOR}+`, "g"), NORMALIZED_ALT_SEPARATOR) // replace multi alt separators with single alt separator
    .replace(new RegExp(`^${NORMALIZED_ALT_SEPARATOR}*(.*?)${NORMALIZED_ALT_SEPARATOR}*$`), "$1") // trim leading/trailing splitters
    .split(useAltSeparatorsAsMainSeparator ? NORMALIZED_ALT_SEPARATOR : BASIC_SEPARATOR)
    .map((part) => {
      if (part.includes(NORMALIZED_ALT_SEPARATOR)) {
        // If the part includes a normalized alt separator, we should return it
        // as an array of words
        return part
          .split(NORMALIZED_ALT_SEPARATOR)
          .flatMap((part) => extractUpperLowerCamelCase(part) ?? [part])
          .map(lowercase);
      }

      // Otherwise it a camelCase word, or just a simple word
      return extractUpperLowerCamelCase(part)?.map(lowercase) ?? lowercase(part);
    });

  if (flattenWordGroups && groups.some(Array.isArray)) {
    const flatGroups = (groups as string[][]).flat();
    return flatGroups;
  }

  // If requireGroup and there are only words and no groups, wrap the words in a group
  if (requireGroup && groups.length && !groups.some(Array.isArray)) {
    return [groups as string[]];
  }

  return groups;
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
    (Array.isArray(input) ? input.join(BASIC_SEPARATOR) : input) ===
    (Array.isArray(compareWordOrGroup)
      ? compareWordOrGroup.join(BASIC_SEPARATOR)
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

  return {
    matchIndex: startMatch?.matchIndex ?? 0,
    endMatchIndex: currentMatch.endMatchIndex,
  };
};

interface InputMatch {
  input: string;
  matchResult: MatchResult;
}

/**
 * Filters the matches to return only the inputs that do not overlap,
 * or when overlapping, the one with the preferred length
 *
 * @param matches - the matches to filter
 * @param overlappingInputPreference - which match to return, when overlaps
 */
const filterOverlappingInputMatches = function (
  matches: InputMatch[],
  overlappingInputPreference: FullWordMatcherOptions["overlappingInputPreference"]
): string[] {
  if (!overlappingInputPreference || overlappingInputPreference === "all") {
    return matches.map((m) => m.input);
  }

  const filteredMatches: InputMatch[] = [];

  matches.forEach((match) => {
    const overlappingMatchIndex = filteredMatches.findIndex((prevMatch) => {
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
    } else if (
      (overlappingInputPreference === "longest" &&
        match.input.length > filteredMatches[overlappingMatchIndex].input.length) ||
      (overlappingInputPreference === "shortest" &&
        match.input.length < filteredMatches[overlappingMatchIndex].input.length)
    ) {
      // Remove the match with who we are overlapping, replace with current
      filteredMatches.splice(overlappingMatchIndex, 1, match);
    }
  });

  return filteredMatches.map((m) => m.input);
};

export interface FullWordMatcherOptions {
  /**
   * If word groups should be flattened, allowing non word groups to match against them.
   * Example: allows "My WordGroup" to match against "My WordGroupExtra"
   */
  flattenWordGroups?: boolean;
  /**
   * When inputs were matched on overlapping words, which one to return.
   * Example: "My Studio", "Second My Studio" both overlap when matched against "second My Studio"
   */
  overlappingInputPreference?: "all" | "longest" | "shortest";
}

export class FullWordExtractor implements Extractor {
  private options: FullWordMatcherOptions;

  constructor(options: FullWordMatcherOptions) {
    this.options = options;
  }

  private filterMatchingInputsForGroup(inputs: string[], pathGroup: string): string[] {
    const compareGroups = splitWords(pathGroup, {
      requireGroup: false,
      flattenWordGroups: !!this.options.flattenWordGroups,
    });

    const matchedInputResults: InputMatch[] = [];

    inputs.forEach((input) => {
      const inputGroups = splitWords(input, {
        requireGroup: true,
        flattenWordGroups: !!this.options.flattenWordGroups,
      });

      const matchResult = doesFullGroupMatch(inputGroups, compareGroups);

      if (matchResult) {
        matchedInputResults.push({
          input,
          matchResult,
        });
      }
    });

    return filterOverlappingInputMatches(
      matchedInputResults,
      this.options.overlappingInputPreference
    );
  }

  public filterMatchingInputs(inputs: string[], comparePath: string): string[] {
    const matchedInputsForPathGroups = comparePath
      .split(/[/|\\]/) // unix or windows path separators
      .map((pathGroup) => this.filterMatchingInputsForGroup(inputs, pathGroup))
      .flat();

    // return unique results since a word can be found multiple times in a path
    return [...new Set(matchedInputsForPathGroups)];
  }
}
