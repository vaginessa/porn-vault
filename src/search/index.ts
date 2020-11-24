import { IConfig } from "../config/schema";
import elasticsearch from "elasticsearch";
import * as logger from "../utils/logger";

let client = new elasticsearch.Client({
  host: "localhost:9200",
  log: "trace",
  apiVersion: "7.x",
});

export function refreshClient(config: IConfig) {
  logger.log("Refresh ES client");
  client = new elasticsearch.Client({
    host: config.search.host,
    log: config.search.log ? "trace" : "error",
    apiVersion: config.search.version,
  });
}

export function getClient() {
  return client;
}

function formatName(name: string) {
  return process.env.NODE_ENV == "development" ? `pv-test-${name}` : `pv-${name}`;
}

export const indexMap = {
  scenes: formatName("scenes"),
  actors: formatName("actors"),
  images: formatName("images"),
};

const indices = Object.values(indexMap);

export async function clearIndices() {
  for (const index of indices) {
    try {
      console.log(`Deleting ${index}`);
      await client.indices.delete({ index });
    } catch (error) {
      logger.log(error.message);
    }
  }
  logger.log("Wiped Elasticsearch");
}

async function ensureIndexExists(name: string) {
  if (!(await client.indices.exists({ index: name }))) {
    await client.indices.create({
      index: name,
    });
    await client.indices.putSettings({
      index: name,
      body: {
        "index.max_result_window": 1000000,
      },
    });
    logger.log("Created index " + name);
  }
}

export async function ensureIndices(wipeData: boolean) {
  if (wipeData) {
    await clearIndices();
  }

  for (const index of indices) {
    await ensureIndexExists(index);
  }
}

import { buildSceneIndex } from "./scene";
import { buildActorIndex } from "./actor";
import { buildImageIndex } from "./image";

export async function buildIndices(): Promise<void> {
  await buildActorIndex();
  await buildSceneIndex();
  await buildImageIndex();
}

/* import { buildActorIndex } from "./actor";
import { buildImageIndex } from "./image";
import { buildMarkerIndex } from "./marker";
import { buildMovieIndex } from "./movie";
import { buildSceneIndex } from "./scene";
import { buildStudioIndex } from "./studio";

export async function buildIndices(): Promise<void> {
  await buildSceneIndex();
  await buildActorIndex();
  await buildMovieIndex();
  await buildStudioIndex();
  await buildImageIndex();
  await buildMarkerIndex();
} */
