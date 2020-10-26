import { Extractor } from "./wordMatcher";

const ALT_SEPARATORS = ["-", "_", ","];

const NORMALIZED_SEPARATOR = " ";

const NORMALIZED_ALT_SEPARATOR = "-";

const ALT_SEP_TRIM_REGEX = new RegExp(
  `${NORMALIZED_ALT_SEPARATOR}?(.+[^${NORMALIZED_ALT_SEPARATOR}])${NORMALIZED_ALT_SEPARATOR}?`
);

/**
 * Splits the string by upper/lower camelCase
 *
 * @param str
 */
const extractUpperLowerCamelCase = (str: string): string[] => {
  // PascalCase, with at least two parts (we want PascalCase, not just Pascal)
  if (/^(?:([A-Z][a-z]+)){2,}$/.test(str)) {
    return [...str.matchAll(/([A-Z][a-z]+)/g)].map((match) => match[0]);
  }

  // camelCase
  if (/^[a-z]+(?:[A-Z][a-z]+)+$/.test(str)) {
    const res = [...str.matchAll(/([a-z]+|(?:[A-Z][a-z]+))/g)].map((match) => match[0]);
    return res;
  }

  return [];
};

/**
 * Splits the string by upper/lower camelCase or returns the input
 * if no camelCase found
 *
 * @param str
 */
const splitOptionalUpperLowerCamelCase = (str: string): string | string[] => {
  const camelCasedWords = extractUpperLowerCamelCase(str);
  if (camelCasedWords.length) {
    return camelCasedWords;
  }

  return str;
};

/**
 * Splits the string according to the alternate separator,
 * and further splits those by upper/lower camelCase
 *
 * @param str
 */
const altToGroups = (str: string): string[] => {
  let wordParts: string[] = [];

  // If the input is strictly words separated by the alternate separator, extract all those words
  if (
    new RegExp(
      `^(([^${NORMALIZED_ALT_SEPARATOR}]+)${NORMALIZED_ALT_SEPARATOR})+[^${NORMALIZED_ALT_SEPARATOR}]+$`
    ).test(str)
  ) {
    wordParts = [...str.matchAll(new RegExp(`([^${NORMALIZED_ALT_SEPARATOR}]+)`, "g"))].map(
      (match) => match[0]
    );
  }

  // flatMap because the camelCase found inside our groups, still belong to this group
  return wordParts.flatMap((part) => splitOptionalUpperLowerCamelCase(part));
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
    !str.includes(NORMALIZED_SEPARATOR) && ALT_SEPARATORS.some((sep) => str.includes(sep));

  const groups = str
    .replace(new RegExp(ALT_SEPARATORS.join("|"), "g"), NORMALIZED_ALT_SEPARATOR) // replace all alternate separators with our alternate splitter
    .replace(/\s+/g, NORMALIZED_SEPARATOR) // replace multi separators with single separator
    .replace(new RegExp(`${NORMALIZED_ALT_SEPARATOR}+`, "g"), NORMALIZED_ALT_SEPARATOR) // replace multi alt separators with single alt separator
    .replace(ALT_SEP_TRIM_REGEX, "$1") // trim leading/trailing splitters
    .split(NORMALIZED_SEPARATOR)
    .map((part) => {
      const wordParts = altToGroups(part);
      if (wordParts.length) {
        return wordParts;
      }

      return splitOptionalUpperLowerCamelCase(part);
    });

  // If we don't want word groups,
  // or if there are only alt separators, convert the word groups to simple words
  if (
    flattenWordGroups ||
    (useAltSeparatorsAsMainSeparator && !requireGroup && groups.some(Array.isArray))
  ) {
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
  isMatch: boolean;
  matchIndex: number;
  endMatchIndex: number;
  restCompareArr: (string | string[])[];
}

/**
 *
 * @param input - the word or groups to match
 * @param compareArr - the array of word or groups to match against
 * @param searchAnywhere - if the match does not have to start at the beginning of 'compareArr'
 */
function getWordMatch(
  input: string | string[],
  compareArr: (string | string[])[],
  searchAnywhere: boolean
): WordMatch {
  console.log("do check ", JSON.stringify(input), "against", JSON.stringify(compareArr));

  if (Array.isArray(input)) {
    if (searchAnywhere) {
      console.log("arr => arr");
      // Find full word group match in compareArr
      const wordMatchIndex = compareArr.findIndex((compareVal) => {
        console.log("try ", JSON.stringify(compareVal));
        return (
          Array.isArray(compareVal) &&
          input.length === compareVal.length &&
          input.every((inputVal, inputValIndex) => {
            console.log(compareVal[inputValIndex].toLowerCase(), inputVal.toLowerCase());
            return compareVal[inputValIndex].toLowerCase() === inputVal.toLowerCase();
          })
        );
      });
      console.log("arr => arr", wordMatchIndex);
      if (wordMatchIndex !== -1) {
        return {
          isMatch: true,
          matchIndex: wordMatchIndex,
          endMatchIndex: wordMatchIndex + 1,
          restCompareArr: compareArr.slice(wordMatchIndex + 1),
        };
      }

      // Else find match against simple words
      const flatInput = input.join(NORMALIZED_SEPARATOR).toLowerCase();
      const flatCompare = compareArr
        .map((v) => (Array.isArray(v) ? "_IGNORED_WORD_GROUP_" : v))
        .join(NORMALIZED_SEPARATOR)
        .toLowerCase();

      const stringMatchIndex = flatCompare.indexOf(flatInput);
      console.log(
        "arr => string",
        JSON.stringify(flatInput),
        " => ",
        JSON.stringify(flatCompare),
        "====> ",
        "start ",
        stringMatchIndex,
        "end ",
        stringMatchIndex + flatInput.length
      );

      if (stringMatchIndex !== -1) {
        const flatCompareSimple = flatCompare
          .replace("_IGNORED_WORD_GROUP_", " ")
          .split(NORMALIZED_SEPARATOR);

        console.log(
          `flatCompare ${JSON.stringify(flatCompare)} flat compare simple, ${JSON.stringify(
            flatCompareSimple
          )}`
        );

        // Find index inside flatCompareSimple, where the match starts
        const startMatchIndex = flatCompareSimple.findIndex((compareVal, compareValIndex) => {
          const prevStr = flatCompareSimple.slice(0, compareValIndex).join(NORMALIZED_SEPARATOR);
          const currStr = flatCompareSimple
            .slice(0, compareValIndex + 1)
            .join(NORMALIZED_SEPARATOR);
          const startIdx = prevStr.length + (compareValIndex > 0 ? 1 : 0);
          const endIdx = currStr.length;
          console.log(
            `START:: at ${JSON.stringify(
              compareVal
            )},${compareValIndex}, prevStr is ${JSON.stringify(prevStr)},  curr is ${JSON.stringify(
              currStr
            )}, start: ${startIdx}, end ${endIdx}`
          );

          // Only return true, if the match STARTS at the start of this word and ENDS
          // at the end of this word
          // because we do not want to match when the input starts/ends in the middle of a word
          return stringMatchIndex === startIdx;
        });
        const endMatchIndex = flatCompareSimple.findIndex((compareVal, compareValIndex) => {
          const prevStr = flatCompareSimple.slice(0, compareValIndex).join(NORMALIZED_SEPARATOR);
          const currStr = flatCompareSimple
            .slice(0, compareValIndex + 1)
            .join(NORMALIZED_SEPARATOR);
          const startIdx = prevStr.length + (compareValIndex > 0 ? 1 : 0);
          const endIdx = currStr.length;
          console.log(
            `END:: at ${JSON.stringify(compareVal)},${compareValIndex}, prevStr is ${JSON.stringify(
              prevStr
            )}, curr is ${JSON.stringify(currStr)}, start: ${startIdx}, end ${endIdx}`
          );

          // Only return true, if the match STARTS at the start of this word and ENDS
          // at the end of this word
          // because we do not want to match when the input starts/ends in the middle of a word
          return stringMatchIndex + flatInput.length === endIdx;
        });

        console.log(startMatchIndex, startMatchIndex + input.length);

        //
        if (startMatchIndex !== -1 && endMatchIndex !== -1) {
          return {
            isMatch: true,
            matchIndex: startMatchIndex,
            endMatchIndex: startMatchIndex + input.length,
            restCompareArr: compareArr.slice(startMatchIndex + input.length),
          };
        }
      }
    } else {
      console.log("arr => flat");
      // Else match against the first element, whether it be a group or word
      const flatInput = input.join(NORMALIZED_SEPARATOR);
      const flatCompare = compareArr
        .map((v) => (Array.isArray(v) ? "_IGNORED_WORD_GROUP_" : v))
        .join(NORMALIZED_SEPARATOR)
        .slice(0, flatInput.length);

      if (flatInput.toLowerCase() === flatCompare.toLowerCase()) {
        const flatCompareSimple = flatCompare
          .replace("_IGNORED_WORD_GROUP_", " ")
          .split(NORMALIZED_SEPARATOR);

        const endMatchIndex = flatCompareSimple.findIndex((compareVal, compareValIndex) => {
          const prevStr = flatCompareSimple.slice(0, compareValIndex).join(NORMALIZED_SEPARATOR);
          const currStr = flatCompareSimple
            .slice(0, compareValIndex + 1)
            .join(NORMALIZED_SEPARATOR);
          const startIdx = prevStr.length + (compareValIndex > 0 ? 1 : 0);
          const endIdx = currStr.length;
          console.log(
            `END:: at ${JSON.stringify(compareVal)},${compareValIndex}, prevStr is ${JSON.stringify(
              prevStr
            )}, curr is ${JSON.stringify(currStr)}, start: ${startIdx}, end ${endIdx}`
          );

          // Only return true, if the match STARTS at the start of this word and ENDS
          // at the end of this word
          // because we do not want to match when the input starts/ends in the middle of a word
          return flatInput.length === endIdx;
        });

        if (endMatchIndex !== -1) {
          return {
            isMatch: true,
            matchIndex: 0,
            endMatchIndex: endMatchIndex + 1,
            restCompareArr: compareArr.slice(endMatchIndex + 1),
          };
        }
      }
    }
  } else {
    if (searchAnywhere) {
      const matchIndex = compareArr.findIndex((compareVal) => {
        // If compareVal is an array, it is a word group, so it can only match the inputVal string,
        // if the group is a single word
        if (
          Array.isArray(compareVal) &&
          compareVal.length === 1 &&
          compareVal[0].toLowerCase() === input.toLowerCase()
        ) {
          return true;
        }
        if (!Array.isArray(compareVal)) {
          // Else if just a string, it can only match if is the same string
          return compareVal.toLowerCase() === input.toLowerCase();
        }
      });

      if (matchIndex !== -1) {
        return {
          isMatch: true,
          matchIndex,
          endMatchIndex: matchIndex + 1,
          restCompareArr: compareArr.slice(matchIndex + 1),
        };
      }
    } else {
      const firstCompareVal = compareArr[0];
      const flatCompareVal = Array.isArray(firstCompareVal)
        ? firstCompareVal.join(NORMALIZED_SEPARATOR)
        : firstCompareVal;
      if (flatCompareVal.toLowerCase() === input.toLowerCase()) {
        return {
          isMatch: true,
          matchIndex: 0,
          endMatchIndex: 1,
          restCompareArr: compareArr.slice(1),
        };
      }
    }
  }

  return {
    isMatch: false,
    matchIndex: -1,
    endMatchIndex: -1,
    restCompareArr: [],
  };
}

interface MatchResult {
  isMatch: boolean;
  matchIndex: number;
  endMatchIndex: number;
}

const doGroupsMatch = (
  wordsAndGroups: (string | string[])[],
  compareWordsAndGroups: (string | string[])[]
): MatchResult => {
  if (wordsAndGroups.length === 0 && compareWordsAndGroups.length === 0) {
    return {
      isMatch: true,
      matchIndex: 0,
      endMatchIndex: 0,
    };
  }

  let startMatch: WordMatch | null = null;
  let currentMatch: WordMatch = {
    isMatch: true,
    matchIndex: 0,
    endMatchIndex: 0,
    restCompareArr: compareWordsAndGroups,
  };
  let i = 0;

  console.log(wordsAndGroups, " => ", compareWordsAndGroups);

  do {
    const nextMatch = getWordMatch(wordsAndGroups[i], currentMatch.restCompareArr, i === 0);
    console.log("match before", nextMatch);
    nextMatch.matchIndex += currentMatch.matchIndex;
    nextMatch.endMatchIndex += currentMatch.endMatchIndex;
    console.log("match ", nextMatch);

    currentMatch = nextMatch;
    if (i === 0) {
      startMatch = currentMatch;
    }

    i++;
    console.log("at end, ", i, wordsAndGroups.length);
  } while (currentMatch.isMatch && i < wordsAndGroups.length);

  return {
    isMatch: currentMatch.isMatch,
    matchIndex: startMatch?.matchIndex ?? 0,
    endMatchIndex: currentMatch.endMatchIndex,
  };
};

const filterOverlappingInputMatches = function (
  matches: { input: string; matchResult: MatchResult }[],
  overlapMatchMethod: "longest" | "shortest"
): string[] {
  const filteredMatches: { input: string; matchResult: MatchResult }[] = [];

  matches.forEach((match) => {
    const overlappingMatchIndex = filteredMatches.findIndex((prevMatch) => {
      const startOverlaps =
        match.matchResult.matchIndex >= prevMatch.matchResult.matchIndex &&
        match.matchResult.matchIndex < prevMatch.matchResult.endMatchIndex;
      const endOverlaps =
        match.matchResult.endMatchIndex > prevMatch.matchResult.matchIndex &&
        match.matchResult.endMatchIndex <= prevMatch.matchResult.endMatchIndex;
      return startOverlaps || endOverlaps;
    });

    if (
      overlappingMatchIndex !== -1 &&
      ((overlapMatchMethod === "longest" &&
        match.input.length > filteredMatches[overlappingMatchIndex].input.length) ||
        (overlapMatchMethod === "shortest" &&
          match.input.length < filteredMatches[overlappingMatchIndex].input.length))
    ) {
      filteredMatches.splice(overlappingMatchIndex, 1, match);
    } else if (overlappingMatchIndex === -1) {
      filteredMatches.push(match);
    }
  });

  return filteredMatches.map((m) => m.input);
};

export interface FullWordMatcherOptions {
  flattenWordGroups?: boolean;
  wordGroupConflictMatchMethod?: "all" | "longest" | "shortest";
}

export class FullWordExtractor implements Extractor {
  private options: FullWordMatcherOptions;

  constructor(options: FullWordMatcherOptions) {
    this.options = options;
  }

  filterMatchingInputs(inputs: string[], compare: string): string[] {
    const compareGroups = splitWords(compare, {
      requireGroup: false,
      flattenWordGroups: !!this.options.flattenWordGroups,
    });

    const matchedInputResults: { input: string; matchResult: MatchResult }[] = [];
    inputs.forEach((input) => {
      const inputGroups = splitWords(input, {
        requireGroup: true,
        flattenWordGroups: false, // the input always needs to be fully matched
      });

      const matchResult = doGroupsMatch(inputGroups, compareGroups);
      console.log(
        `for input ${JSON.stringify(input)}, match res is ${JSON.stringify(matchResult)}`
      );

      if (matchResult.isMatch) {
        matchedInputResults.push({
          input,
          matchResult,
        });
      }
    });

    if (
      !this.options.flattenWordGroups ||
      !this.options.wordGroupConflictMatchMethod ||
      this.options.wordGroupConflictMatchMethod === "all"
    ) {
      // If we didn't flatten the word groups, there is only one match per substring.
      // Otherwise if we did, but don't care about overlaps
      // => return all matches
      return matchedInputResults.map((m) => m.input);
    }

    // Otherwise, we did flatten word groups, and we only want a single input to match per substring
    const groupedMatches = filterOverlappingInputMatches(
      matchedInputResults,
      this.options.wordGroupConflictMatchMethod
    );
    return groupedMatches;
  }
}
