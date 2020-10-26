import ffmpeg from "fluent-ffmpeg";
import { existsSync } from "fs";
import path from "path";

import { IConfig } from "../config/schema";
import { checkUnusedPlugins, validatePlugins } from "../plugins/validate";
import * as logger from "../utils/logger";
import { isRegExp } from "../utils/types";

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

/**
 * Does extra validation on the config.
 * Exits if invalid.
 * Sets the ffmpeg binary paths to the ones in the config
 *
 * @param config - the config the check
 */
export function validateConfigExtra(config: IConfig): void {
  validatePlugins(config);
  checkUnusedPlugins(config);

  logger.message("Registered plugins", Object.keys(config.plugins.register));
  logger.log(config);

  if (config.scan.excludeFiles && config.scan.excludeFiles.length) {
    for (const regStr of config.scan.excludeFiles) {
      if (!isRegExp(regStr)) {
        logger.error(`Invalid regex: '${regStr}'.`);
        process.exit(1);
      }
    }
  }

  validateFFMPEGPaths(config);

  const ffmpegPath = path.resolve(config.binaries.ffmpeg);
  const ffprobePath = path.resolve(config.binaries.ffprobe);

  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);

  logger.message("FFMPEG set to " + ffmpegPath);
  logger.message("FFPROBE set to " + ffprobePath);
}
