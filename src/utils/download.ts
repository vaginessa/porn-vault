import axios from "axios";
import ProgressBar from "cli-progress";
import { createWriteStream, existsSync } from "fs";
import { Stream } from "stream";

import * as logger from "../utils/logger";
import { Dictionary } from "../utils/types";

export async function downloadFile(url: string, file: string): Promise<void> {
  if (existsSync(file)) return;

  logger.message(`Downloading ${url}...`);

  const downloadBar = new ProgressBar.SingleBar({}, ProgressBar.Presets.legacy);
  downloadBar.start(100, 0);

  const response = await axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });
  const stream = response.data as Stream;

  const writer = createWriteStream(file);

  const totalSize = parseInt((<Dictionary<string>>response.headers)["content-length"]);
  let loaded = 0;

  stream.on("data", (data: Buffer) => {
    loaded += Buffer.byteLength(data);
    const percent = ((loaded / totalSize) * 100).toFixed(0);
    downloadBar.update(+percent);
  });

  stream.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", (err: Error) => {
      logger.error(`Error while downloading ${url}`);
      reject(err);
    });
  });

  downloadBar.stop();
}
