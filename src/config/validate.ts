import { existsSync } from "fs";

import { IConfig } from "../config/schema";
import * as logger from "../utils/logger";

export function validateFFMPEGPaths(config: IConfig): void {
  if (config.binaries.ffmpeg) {
    const found = existsSync(config.binaries.ffmpeg);
    if (!found) {
      logger.error(`FFMPEG binary not found at ${config.binaries.ffmpeg}`);
      process.exit(1);
    }
  } else {
    logger.error(`No FFMPEG path defined in config.json`);
    process.exit(1);
  }

  if (config.binaries.ffprobe) {
    const found = existsSync(config.binaries.ffprobe);
    if (!found) {
      logger.error(`FFPROBE binary not found at ${config.binaries.ffprobe}`);
      process.exit(1);
    }
  } else {
    logger.error(`No FFPROBE path defined in config.json`);
    process.exit(1);
  }
}
