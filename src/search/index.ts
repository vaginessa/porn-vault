import elasticsearch from "elasticsearch";

import { IConfig } from "../config/schema";
import * as logger from "../utils/logger";
import { buildActorIndex } from "./actor";
import { buildImageIndex } from "./image";
import { buildMarkerIndex } from "./marker";
import { buildMovieIndex } from "./movie";
import { buildSceneIndex } from "./scene";
import { buildStudioIndex } from "./studio";

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
    httpAuth: config.search.auth || undefined,
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
  studios: formatName("studios"),
  movies: formatName("movies"),
  markers: formatName("markers"),
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

async function ensureIndexExists(name: string): Promise<boolean> {
  logger.log(`Checking index ${name}`);
  if (!(await client.indices.exists({ index: name }))) {
    await client.indices.create({
      index: name,
    });
    await client.indices.putSettings({
      index: name,
      body: {
        "index.max_result_window": 2500000,
      },
    });
    logger.log("Created index " + name);
    return true;
  }
  return false;
}

export async function ensureIndices(wipeData: boolean) {
  if (wipeData) {
    await clearIndices();
  }

  for (const indexKey in indexMap) {
    const created = await ensureIndexExists(indexMap[indexKey]);
    if (created) {
      await {
        scenes: buildSceneIndex,
        actors: buildActorIndex,
        images: buildImageIndex,
        studios: buildStudioIndex,
        movies: buildMovieIndex,
        markers: buildMarkerIndex,
      }[indexKey]();
    }
  }
}

export async function buildIndices(): Promise<void> {
  await buildActorIndex();
  await buildSceneIndex();
  await buildImageIndex();
  await buildMovieIndex();
  await buildStudioIndex();
  await buildMarkerIndex();
}
