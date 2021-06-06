import { Router } from "express";
import { dirname, resolve } from "path";

import { readdirAsync, statAsync } from "../utils/fs/async";
import { logger } from "../utils/logger";

const router = Router();

interface FileDTO {
  name: string;
  path: string;
  size: number;
  createdOn: number;
  dir: boolean;
}

interface FolderDTO {
  path: string;
  files: FileDTO[];
  parentFolder: string;
  hasParentFolder: boolean;
}

router.get("/directory", async (req, res) => {
  let path = resolve(String(req.query.path || process.cwd()));
  let validDirectory = false;

  const files: FileDTO[] = [];
  let entries: string[] = [];

  while (!validDirectory) {
    try {
      entries = await readdirAsync(path);
      validDirectory = true;
    } catch (err) {
      validDirectory = false;
      path = dirname(path);
    }
  }

  for (const entry of entries) {
    try {
      const filePath = resolve(path, entry);
      const stats = await statAsync(filePath);
      files.push({
        name: entry,
        path: filePath,
        size: stats.size,
        createdOn: stats.mtime.valueOf(),
        dir: stats.isDirectory(),
      });
    } catch (err) {
      logger.warn(`Could not stat entry ${entry} for directory list`);
    }
  }

  files.sort((a, b) => {
    if (a.dir === b.dir) {
      return a.name.localeCompare(b.name);
    }
    return a.dir ? -1 : 1;
  });

  const parentFolder = resolve(path, "..");

  const folder: FolderDTO = {
    path,
    files,
    parentFolder,
    hasParentFolder: path !== parentFolder,
  };

  res.json(folder);
});

export default router;
