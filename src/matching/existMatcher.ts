import * as zod from "zod";

import { formatMessage, logger } from "../utils/logger";
import { ignoreSingleNames, Matcher, MatchSource, SourceInputMatch } from "./matcher";

export const ExistMatcherOptionsSchema = zod.object({
  ignoreSingleNames: zod.boolean(),
  stripString: zod.string(),
});

export type ExistMatcherOptions = zod.TypeOf<typeof ExistMatcherOptionsSchema>;

export const ExistMatcherSchema = zod.object({
  options: ExistMatcherOptionsSchema,
});

export type ExistMatcherType = zod.TypeOf<typeof ExistMatcherSchema>;

export const DEFAULT_EXIST_MATCHER: ExistMatcherType = {
  options: { ignoreSingleNames: false, stripString: "[^a-zA-Z0-9'/\\,()[\\]{}-]" },
};

export function stripStr(str: string, regexp: string): string {
  const regex = new RegExp(regexp, "gi");
  return str.trim().toLowerCase().replace(regex, "");
}

export class ExistMatcher implements Matcher {
  private options: ExistMatcherOptions;

  constructor(options: ExistMatcherOptions) {
    this.options = options;
  }

  extractMatches<T extends MatchSource>(
    itemsToMatch: T[],
    str: string,
    getInputs: (matchSource: T) => string[],
    sortByLongestMatch?: boolean
  ): SourceInputMatch<T>[] {
    logger.verbose(`(Exist matcher) Filtering ${itemsToMatch.length} items using term "${str}"`);
    const cleanStr = stripStr(str, this.options.stripString);

    const matches: SourceInputMatch<T>[] = [];

    itemsToMatch.forEach((source) => {
      const inputs = getInputs(source);
      logger.silly(
        `(Exist matcher) Filtering inputs (ignoreSingleNames: ${this.options.ignoreSingleNames})`
      );
      const filteredInputs = this.options.ignoreSingleNames ? ignoreSingleNames(inputs) : inputs;

      for (const input of filteredInputs) {
        const cleanInput = stripStr(input, this.options.stripString);
        logger.silly(`(Exist matcher) Checking if "${cleanInput} matches "${cleanStr}"`);
        const matchIndex = cleanInput === cleanStr ? 0 : -1;
        logger.silly(`(Exist matcher) Substring index: ${matchIndex}`);
        if (matchIndex !== -1) {
          logger.warn(
            `(Exist matcher) matched str: ${str} for one of source inputs: ${formatMessage(inputs)}`
          );
          matches.push({
            source,
            sourceId: source._id,
            matchIndex,
            endMatchIndex: matchIndex + cleanInput.length,
          });

          // Don't look for additional input matches of the source
          return;
        }
      }
    });

    if (sortByLongestMatch) {
      logger.debug(`(Exist matcher) Sorting results by longest match`);
      matches.sort((a, b) => b.source.name.length - a.source.name.length);
    }

    logger.verbose(`(Exist matcher) Matched ${matches.length} items`);
    return matches;
  }

  filterMatchingItems<T extends MatchSource>(
    itemsToMatch: T[],
    str: string,
    getInputs: (matchSource: T) => string[],
    sortByLongestMatch?: boolean
  ): T[] {
    return this.extractMatches(itemsToMatch, str, getInputs, sortByLongestMatch).map(
      (match) => match.source
    );
  }

  isMatchingItem<T extends MatchSource>(
    item: T,
    str: string,
    getInputs: (matchSource: T) => string[]
  ): boolean {
    logger.silly(`(Exist matcher) Checking if ${str} matches item ${formatMessage(item)}`);
    const res = this.filterMatchingItems([item], str, getInputs);
    return !!res.length;
  }
}
