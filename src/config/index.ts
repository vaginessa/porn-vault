import { readFileSync, writeFileSync, existsSync } from "fs";
import * as logger from "../logger";
import setupFunction from "../setup";

export interface IConfig {
  LIBRARY_PATH: string;

  FFMPEG_PATH: string;
  FFPROBE_PATH: string;

  GENERATE_THUMBNAILS: boolean;
  THUMBNAIL_INTERVAL: number;

  PASSWORD: string | null;

  PORT: number;
}

export const defaultConfig: IConfig = {
  LIBRARY_PATH: process.cwd(),
  FFMPEG_PATH: "",
  FFPROBE_PATH: "",
  GENERATE_THUMBNAILS: true,
  THUMBNAIL_INTERVAL: 60,
  PASSWORD: null,
  PORT: 3000
};

let config = JSON.parse(JSON.stringify(defaultConfig)) as IConfig;

export async function checkConfig() {
  if (existsSync("config.json")) {
    config = JSON.parse(readFileSync("config.json", "utf-8"));

    let defaultOverride = false;
    for (const key in defaultConfig) {
      if (config[key] === undefined) {
        config[key] = defaultConfig[key];
        defaultOverride = true;
      }
    }

    if (defaultOverride) {
      writeFileSync("config.json", JSON.stringify(config), "utf-8");
    }
    return false;
  } else {
    config = await setupFunction();
    writeFileSync("config.json", JSON.stringify(config), "utf-8");
    logger.warn("Created config.json. Please edit.");
    return true;
  }
}

export function getConfig() {
  if (existsSync("config.json"))
    return JSON.parse(readFileSync("config.json", "utf-8")) as IConfig;
  return defaultConfig;
}
