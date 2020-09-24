import * as path from "path";

import { getConfig } from "../config/index";
import * as logger from "./logger";

export function validRating(val: unknown): val is number {
  return typeof val === "number" && val >= 0 && val <= 10 && Number.isInteger(val);
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

export function libraryPath(str: string): string {
  return path.join(getConfig().persistence.libraryPath, "library", str);
}
