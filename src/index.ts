import ffmpeg from "fluent-ffmpeg";

import args from "./args";
import { checkConfig, getConfig } from "./config";
import { IConfig } from "./config/schema";
import { validateFFMPEGPaths } from "./config/validate";
import { applyExitHooks } from "./exit";
import { deleteGianna, ensureGiannaExists } from "./gianna";
import { deleteIzzy, ensureIzzyExists } from "./izzy";
import * as logger from "./logger";
import { printMaxMemory } from "./mem";
import { checkUnusedPlugins, validatePlugins } from "./plugins/validate";
import { queueLoop } from "./queue_loop";
import startServer from "./server";
import { isRegExp } from "./types/utility";

export function onConfigLoad(config: IConfig): void {
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

  ffmpeg.setFfmpegPath(config.binaries.ffmpeg);
  ffmpeg.setFfprobePath(config.binaries.ffprobe);

  logger.message("FFMPEG set to " + config.binaries.ffmpeg);
  logger.message("FFPROBE set to " + config.binaries.ffprobe);
}

async function startup() {
  logger.log("Startup...");

  printMaxMemory();

  await checkConfig();
  const config = getConfig();

  onConfigLoad(config);

  if (args["process-queue"] === true) {
    await queueLoop(config);
  } else {
    if (args["update-gianna"]) {
      await deleteGianna();
    }

    if (args["update-izzy"]) {
      await deleteIzzy();
    }

    try {
      let downloadedBins = 0;
      downloadedBins += await ensureIzzyExists();
      downloadedBins += await ensureGiannaExists();
      if (downloadedBins > 0) {
        logger.success("Binaries downloaded. Please restart.");
        process.exit(0);
      }
      applyExitHooks();
      startServer().catch((err: Error) => {
        const _err = err;
        logger.error(_err.message);
      });
    } catch (err) {
      const _err = err as Error;
      logger.log(_err);
      logger.error(_err.message);
      process.exit(1);
    }
  }
}

if (!process.env.PREVENT_STARTUP) {
  startup().catch((err: Error) => {
    logger.error(err.message);
  });
}
