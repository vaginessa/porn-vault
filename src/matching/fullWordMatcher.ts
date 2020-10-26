import { Extractor } from "./wordMatcher";

const ALT_SEPARATORS = ["-", "_", ","];

const NORMALIZED_SEPARATOR = " ";

const SPLITTER = "-";

const toGroups = (str: string, requireGroup: boolean): (string | string[])[] => {
  const useAltSeparatorsAsMainSeparator =
    !str.includes(NORMALIZED_SEPARATOR) && ALT_SEPARATORS.some((sep) => str.includes(sep));

  const groups = str
    .replace(new RegExp(ALT_SEPARATORS.join("|"), "g"), SPLITTER) // replace all alternate separators with a single splitter
    .replace(/\s+/g, NORMALIZED_SEPARATOR) // replace multi separators with single separator
    .replace(new RegExp(`${SPLITTER}+`, "g"), SPLITTER) // replace multi splitters with single splitter
    .replace(new RegExp(`${SPLITTER}?(.+[^${SPLITTER}])${SPLITTER}?`), "$1") // trim leading/trailing splitters
    .split(NORMALIZED_SEPARATOR)
    .map((part) => {
      let wordParts: string[] = [];

      if (new RegExp(`^(([^${SPLITTER}]+)${SPLITTER})+[^${SPLITTER}]+$`).test(part)) {
        // return part.replace(new RegExp(`^(.+)${SPLITTER}(.+)$`, "g"), "$1 $2").split(" ");
        wordParts = [...part.matchAll(new RegExp(`([^${SPLITTER}]+)`, "g"))].map(
          (match) => match[0]
        );
      }

      if (new RegExp(`^.+${NORMALIZED_SEPARATOR}.+$`).test(part)) {
        wordParts = part
          .replace(new RegExp(`^(.+)${NORMALIZED_SEPARATOR}(.+)$`, "g"), "$1 $2")
          .split(NORMALIZED_SEPARATOR);
      }

      if (wordParts.length) {
        return wordParts.flatMap((part) => {
          // PascalCase, with at least two parts (we want PascalCase, not just Pascal)
          if (/^(?:([A-Z][a-z]+)){2,}$/.test(part)) {
            return [...part.matchAll(/([A-Z][a-z]+)/g)].map((match) => match[0]);
          }

          // camelCase
          if (/^[a-z]+[A-Z][a-z]+$/.test(part)) {
            return part.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
          }
          return part;
        });
      }

      // PascalCase, with at least two parts (we want PascalCase, not just Pascal)
      if (/^(?:([A-Z][a-z]+)){2,}$/.test(part)) {
        return [...part.matchAll(/([A-Z][a-z]+)/g)].map((match) => match[0]);
      }

      // camelCase
      if (/^[a-z]+[A-Z][a-z]+$/.test(part)) {
        return part.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
      }

      return part;
    });

  // If we want to use the alt separators instead of the normalized one, convert
  // the word groups to simple words
  if (useAltSeparatorsAsMainSeparator && !requireGroup && groups.some(Array.isArray)) {
    const flatGroups = (groups as string[][]).flat();
    return flatGroups;
  }

  // If requireGroup and there are only words and no groups, wrap the words in a group
  if (requireGroup && groups.length && !groups.some(Array.isArray)) {
    return [groups as string[]];
  }

  return groups;
};

function isWordMatch(
  input: string | string[],
  compareArr: (string | string[])[],
  searchAnywhere: boolean
): {
  isMatch: boolean;
  matchIndex: number;
  endMatchIndex: number;
  restCompareArr: (string | string[])[];
} {
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

        console.log("flatCompare", flatCompare, " flat compare simple ", flatCompareSimple);

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
      // Else match against the first element, whether it be a group or word
      const flatInput = input.join(NORMALIZED_SEPARATOR);
      const flatCompare = compareArr
        .map((v) => (Array.isArray(v) ? "_IGNORED_WORD_GROUP_" : v))
        .join(NORMALIZED_SEPARATOR)
        .slice(0, flatInput.length);

      if (flatInput.toLowerCase() === flatCompare.toLowerCase()) {
        return {
          isMatch: true,
          matchIndex: 0,
          endMatchIndex: flatInput.length,
          restCompareArr: compareArr.slice(input.length),
        };
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

const groupsMatch = (
  wordsAndGroups: (string | string[])[],
  compareWordsAndGroups: (string | string[])[]
): boolean => {
  if (wordsAndGroups.length === 0 && compareWordsAndGroups.length === 0) {
    return true;
  }

  let match = {
    isMatch: true,
    matchIndex: 0,
    endMatchIndex: 0,
    restCompareArr: compareWordsAndGroups,
  };
  let i = 0;

  console.log(wordsAndGroups, " => ", compareWordsAndGroups);

  do {
    const nextMatch = isWordMatch(wordsAndGroups[i], match.restCompareArr, i === 0);
    console.log("match ", nextMatch);
    if (!nextMatch.isMatch) {
      return false;
    }
    match = nextMatch;
    i++;
    console.log("at end, ", i, wordsAndGroups.length);
  } while (match.isMatch && i < wordsAndGroups.length);

  return match.isMatch;
};

export class FullWordExtractor implements Extractor {
  filterMatchingInputs(inputs: string[], compare: string): string[] {
    const compareGroups = toGroups(compare, false);

    const matchedInputs = inputs.filter((input) => {
      const inputGroups = toGroups(input, true);

      return groupsMatch(inputGroups, compareGroups);
    });

    return matchedInputs;
  }
}
