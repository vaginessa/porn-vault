import Axios from "axios";

import { IConfig } from "./config/schema";
import Image from "./types/image";
import Scene, { ThumbnailFile } from "./types/scene";
import { statAsync } from "./utils/fs/async";
import * as logger from "./utils/logger";

async function getQueueHead(config: IConfig): Promise<Scene> {
  logger.log("Getting queue head...");
  return (
    await Axios.get<Scene>(`http://localhost:${config.server.port}/queue/head`, {
      params: {
        password: config.auth.password,
      },
    })
  ).data;
}

export async function queueLoop(config: IConfig): Promise<void> {
  try {
    let queueHead = await getQueueHead(config);

    while (queueHead) {
      try {
        logger.log(`Processing ${queueHead.path}...`);
        const data = {
          processed: true,
        } as Record<string, unknown>;
        const images = [] as Image[];
        const thumbs = [] as Image[];

        if (config.processing.generatePreviews && !queueHead.preview) {
          const preview = await Scene.generatePreview(queueHead);

          if (preview) {
            const image = new Image(queueHead.name + " (preview)");
            const stats = await statAsync(preview);
            image.path = preview;
            image.scene = queueHead._id;
            image.meta.size = stats.size;
            thumbs.push(image);
            data.preview = image._id;
          } else {
            logger.error(`Error generating preview.`);
          }
        } else {
          logger.message("Skipping preview generation");
        }

        if (config.processing.generateScreenshots) {
          let screenshots = [] as ThumbnailFile[];
          try {
            screenshots = await Scene.generateThumbnails(queueHead);
          } catch (error) {
            logger.error(error);
          }
          for (let i = 0; i < screenshots.length; i++) {
            const file = screenshots[i];
            const image = new Image(`${queueHead.name} ${i + 1} (screenshot)`);
            image.addedOn += i;
            image.path = file.path;
            image.scene = queueHead._id;
            image.meta.size = file.size;
            images.push(image);
          }
        } else {
          logger.message("Skipping screenshot generation");
        }

        await Axios.post(
          `http://localhost:${config.server.port}/queue/${queueHead._id}`,
          { scene: data, thumbs, images },
          {
            params: {
              password: config.auth.password,
            },
          }
        );
      } catch (error) {
        const _err = error as Error;
        logger.error("PROCESSING ERROR");
        logger.log(_err);
        logger.error(_err.message);
        await Axios.delete(`http://localhost:${config.server.port}/queue/${queueHead._id}`, {
          params: {
            password: config.auth.password,
          },
        });
      }
      queueHead = await getQueueHead(config);
    }

    logger.success("Processing done.");
    process.exit(0);
  } catch (error) {
    const _err = error as Error;
    logger.error(`Processing error: ${_err.message}`);
    process.exit(1);
  }
}
