import * as logger from "./logger";
import { isNumber } from "./types";

export function validRating(val: unknown): val is number {
  return isNumber(val) && val >= 0 && val <= 10 && Number.isInteger(val);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createObjectSet<T extends Record<string, any>>(
  objs: T[],
  key: keyof T & string
): T[] {
  const dict = {} as { [key: string]: T };
  for (const obj of objs) {
    dict[obj[key]] = obj;
  }
  const set = [] as T[];
  for (const key in dict) {
    set.push(dict[key]);
  }
  return set;
}

export function isValidUrl(str: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

/**
 * Generates an array of timestamps at regular intervals
 *
 * @param count - the amount of timestamps to generate
 * @param duration - the duration of the media. If given, will generate timestamps in seconds
 * based on this duration. Otherwise, will generate in percentage strings
 * @param options - generation options
 * @param options.startPercentage - where to start the timestamp generation, as a percentage
 * @param options.endPercentage - where to stop the timestamp generation, as a percentage
 */
export function generateTimestampsAtIntervals(
  count: number,
  duration: number | null = null,
  options: { startPercentage: number; endPercentage: number } = {
    startPercentage: 0,
    endPercentage: 100,
  }
): string[] {
  const timestamps: string[] = [];

  let startPosition: number;
  let endPosition: number;

  if (duration) {
    const secondsPerPercent = duration / 100;
    startPosition = secondsPerPercent * options.startPercentage;
    endPosition = secondsPerPercent * options.endPercentage;
  } else {
    startPosition = options.startPercentage;
    endPosition = options.endPercentage;
  }

  const interval = (endPosition - startPosition) / count;

  for (let i = 0; i < count; i++) {
    timestamps.push(`${startPosition + interval * i}${duration ? "" : "%"}`);
  }

  return timestamps;
}

/**
 * Copies the properties of the defaults to the target.
 * WARNING: Will not enter arrays.
 * Mutates the target object
 *
 * @param target - the object which to merge the missing properties into
 * @param defaults - objects whose properties to copy
 */
export function mergeMissingProperties(
  target: Record<string, unknown>,
  ...defaults: Record<string, unknown>[]
): Record<string, unknown> {
  if (typeof target !== "object" || !target) {
    target = {};
  }

  const mergesToDo = defaults.map((defaultObj) => ({ target, defaultObj }));

  function copy(currentTarget: Record<string, unknown>, currentSource: Record<string, unknown>) {
    const propStack = Object.getOwnPropertyNames(currentSource);
    let prop = propStack.shift();

    while (prop) {
      if (!Object.hasOwnProperty.call(currentTarget, prop)) {
        currentTarget[prop] = currentSource[prop];
      } else if (
        currentTarget[prop] &&
        typeof currentTarget[prop] === "object" &&
        !Array.isArray(currentTarget[prop])
      ) {
        mergesToDo.push({
          target: currentTarget[prop] as Record<string, unknown>,
          defaultObj: currentSource[prop] as Record<string, unknown>,
        });
      }

      prop = propStack.shift();
    }
  }

  let mergeInstruction = mergesToDo.shift();
  while (mergeInstruction) {
    copy(mergeInstruction.target, mergeInstruction.defaultObj);
    mergeInstruction = mergesToDo.shift();
  }

  return target;
}

/**
 * Removes properties from the target, that do not exist in the default
 * WARNING: Will not enter arrays.
 *
 * @param target - the object to clean
 * @param defaultObj - the object with the properties to keep
 * @param ignorePaths - paths to ignore stripping
 */
export function removeUnknownProperties(
  target: Record<string, unknown>,
  defaultObj: Record<string, unknown>,
  ignorePaths: string[] = []
): Record<string, unknown> {
  if (typeof target !== "object" || !target) {
    target = {};
  }

  const removalsToDo = [{ target, defaultObj, parentPath: "" }];

  function isObj(target: unknown): target is Record<string, unknown> {
    return target && typeof target === "object" && !Array.isArray(target);
  }

  function removeUnknown(
    currentTarget: Record<string, unknown>,
    currentSource: Record<string, unknown>,
    parentPath = ""
  ) {
    const propStack = Object.getOwnPropertyNames(currentTarget);
    let prop = propStack.shift();

    while (prop) {
      const propPath = `${parentPath ? `${parentPath}.` : ""}${prop}`;
      const isIgnoredPath = ignorePaths.includes(propPath);

      if (!Object.hasOwnProperty.call(currentSource, prop) && !isIgnoredPath) {
        delete currentTarget[prop];
      } else if (isObj(currentTarget[prop]) && isObj(currentSource[prop]) && !isIgnoredPath) {
        removalsToDo.push({
          target: currentTarget[prop] as Record<string, unknown>,
          defaultObj: currentSource[prop] as Record<string, unknown>,
          parentPath: propPath,
        });
      }

      prop = propStack.shift();
    }
  }

  let removalInstruction = removalsToDo.shift();
  while (removalInstruction) {
    removeUnknown(
      removalInstruction.target,
      removalInstruction.defaultObj,
      removalInstruction.parentPath
    );
    removalInstruction = removalsToDo.shift();
  }

  return target;
}
