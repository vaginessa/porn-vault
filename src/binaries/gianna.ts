import Axios from "axios";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { chmodSync, existsSync } from "fs";
import { arch, type } from "os";

import { getConfig } from "../config";
import { downloadFile } from "../utils/download";
import { unlinkAsync } from "../utils/fs/async";
import * as logger from "../utils/logger";
import { configPath } from "../utils/path";

export let giannaProcess!: ChildProcessWithoutNullStreams;

export const giannaPath = configPath(type() === "Windows_NT" ? "gianna.exe" : "gianna");

export async function deleteGianna(): Promise<void> {
  await unlinkAsync(giannaPath);
}

interface IGithubAsset {
  // eslint-disable-next-line camelcase
  browser_download_url: string;
  name: string;
}

export async function giannaVersion(): Promise<string | null> {
  try {
    const res = await Axios.get<{ version: string }>(
      `http://localhost:${getConfig().binaries.giannaPort}/`
    );
    return res.data.version;
  } catch {
    return null;
  }
}

export async function resetGianna(): Promise<void> {
  try {
    await Axios.delete(`http://localhost:${getConfig().binaries.giannaPort}/index`);
  } catch (error) {
    const _err = error as Error;
    logger.error("Error while resetting gianna");
    logger.log(_err.message);
    throw _err;
  }
}

/**
 * @throws
 */
async function downloadGianna() {
  logger.log("Fetching Gianna releases...");
  const releaseUrl = `https://api.github.com/repos/boi123212321/gianna/releases/latest`;

  const releaseInfo = (
    await Axios.get<{
      id: string;
    }>(releaseUrl)
  ).data;
  const releaseId = releaseInfo.id;

  const assetsUrl = `https://api.github.com/repos/boi123212321/gianna/releases/${releaseId}/assets`;

  const assets = (await Axios.get(assetsUrl)).data as IGithubAsset[];

  const downloadName = {
    Windows_NT: "gianna.exe",
    Linux: "gianna_linux",
    Darwin: "gianna_mac",
  }[type()] as string;

  if (arch() !== "x64") {
    throw new Error(`Unsupported architecture ${arch()}`);
  }

  const asset = assets.find((as) => as.name === downloadName);

  if (!asset) {
    throw new Error(`Gianna release not found: ${downloadName} for ${type()}`);
  }

  // eslint-disable-next-line camelcase
  await downloadFile(asset.browser_download_url, giannaPath);
}

/**
 * @throws
 */
export async function ensureGiannaExists(): Promise<0 | 1> {
  if (existsSync(giannaPath)) {
    logger.log("Gianna binary found");
    return 0;
  } else {
    logger.message("Downloading latest Gianna (search engine) binary...");
    await downloadGianna();
    return 1;
  }
}

export function spawnGianna(): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.log("CHMOD Gianna...");
    chmodSync(giannaPath, "111");

    logger.log("Spawning Gianna");

    const port = getConfig().binaries.giannaPort;

    giannaProcess = spawn(giannaPath, ["--port", port.toString()]);
    let responded = false;
    giannaProcess.on("error", (err: Error) => {
      reject(err);
    });
    giannaProcess.stdout.on("data", async () => {
      if (!responded) {
        logger.log(`Gianna ready on port ${port}`);
        responded = true;
        await new Promise((resolve) => setTimeout(resolve, 200));
        resolve();
      }
    });
    giannaProcess.stderr.on("data", (data: Buffer) => {
      logger.gianna(data.toString());
    });
  });
}
