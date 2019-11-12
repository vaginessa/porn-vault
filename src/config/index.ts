import { readFileSync, existsSync, writeFileSync } from "fs";
import * as logger from "../logger";
import setupFunction from "../setup";

export interface IConfig {
  LIBRARY_PATH: string;

  FFMPEG_PATH: string;
  FFPROBE_PATH: string;

  THUMBNAIL_INTERVAL: number;

  DOWNLOAD_FFMPEG_BIN: boolean;

  PASSWORD: string | null;
}

export const defaultConfig: IConfig = {
  LIBRARY_PATH: process.cwd(),
  FFMPEG_PATH: "",
  FFPROBE_PATH: "",
  THUMBNAIL_INTERVAL: 60,
  DOWNLOAD_FFMPEG_BIN: false,
  PASSWORD: null
}

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
  }
  else {

    // TODO: inquirer setup

    config = await setupFunction();
    writeFileSync("config.json", JSON.stringify(config), "utf-8");
    logger.WARN("Created config.json. Please edit.")
  }
}

export default config;