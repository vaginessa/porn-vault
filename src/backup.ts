import { existsSync, mkdirSync } from "fs";
import { join } from "path";

import { mapAsync } from "./utils/async";
import { copyFileAsync, mkdirpSync, readdirAsync, rimrafAsync } from "./utils/fs/async";
import { logger } from "./utils/logger";
import { configPath, libraryPath } from "./utils/path";

async function checkBackupMax(amount = 10) {
  const backups = await readdirAsync(configPath("backups"));
  backups.sort();
  if (backups.length >= amount) {
    const oldestBackup = configPath("backups", backups[0]);
    logger.verbose(`Removing oldest backup: ${oldestBackup}...`);
    await rimrafAsync(oldestBackup);
  }
}

export async function createBackup(amount = 10): Promise<void> {
  mkdirpSync(configPath("backups"));
  const foldername = configPath("backups", new Date().valueOf().toString(36));
  mkdirSync(foldername);
  logger.info(`Creating backup in ${foldername}...`);

  const files = [
    "actors.db",
    "images.db",
    "labels.db",
    "movies.db",
    "studios.db",
    "scenes.db",
    "markers.db",
    "actor_references.db",
    "marker_references.db",
    "movie_scenes.db",
    "labelled_items.db",
    "custom_fields.db",
    "scene_views.db",
  ];

  const transfers = await mapAsync(files, (file) => {
    return {
      from: libraryPath(file),
      to: join(foldername, file),
    };
  });

  logger.silly("Backup transfers:");
  logger.silly(transfers);

  for (const { from, to } of transfers) {
    if (!existsSync(from)) {
      logger.debug(`${from} does not exist, skipping...`);
      continue;
    }

    logger.verbose(`Backup: ${from} -> ${to}...`);
    await copyFileAsync(from, to);
  }

  await checkBackupMax(amount);
  logger.info("Backup done.");
}
