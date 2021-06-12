import elasticsearch from "elasticsearch";

import { IConfig } from "../config/schema";
import { mapAsync } from "../utils/async";
import { handleError, logger } from "../utils/logger";
import { buildActorIndex } from "./actor";
import { buildImageIndex } from "./image";
import { MAX_RESULT } from "./internal/constants";
import { buildMarkerIndex } from "./marker";
import { buildMovieIndex } from "./movie";
import { buildSceneIndex } from "./scene";
import { buildStudioIndex } from "./studio";

let client = new elasticsearch.Client({
  host: "localhost:9200",
  log: "error",
  apiVersion: "7.x",
});

export function refreshClient(config: IConfig) {
  logger.debug("Refreshing ES client");
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
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
    return `pv-${name}`;
  }
  return `pv-${process.env.NODE_ENV}-${name}`;
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
  try {
    logger.verbose(`Deleting indices: ${indices.join(", ")}`);
    await client.indices.delete({ index: indices });
  } catch (error) {
    handleError("Error deleting indices", error);
  }
  logger.info("Wiped Elasticsearch");
}

async function ensureIndexExists(name: string): Promise<boolean> {
  logger.verbose(`Checking index ${name}`);
  if (!(await client.indices.exists({ index: name }))) {
    await client.indices.create({
      index: name,
      body: {
        settings: {
          analysis: {
            analyzer: {
              pv_analyzer: {
                type: "custom",
                tokenizer: "classic",
                char_filter: ["html_strip", "pv_filter"],
                filter: ["lowercase"],
              },
            },
            char_filter: {
              pv_filter: {
                type: "pattern_replace",
                pattern: "[_]",
                replacement: " ",
              },
            },
          },
        },
        mappings: {
          dynamic: true,
          properties: {
            name: {
              type: "text",
              analyzer: "pv_analyzer",
            },
            rawName: {
              type: "keyword",
            },
          },
        },
      },
    });
    await client.indices.putSettings({
      index: name,
      body: {
        "index.max_result_window": MAX_RESULT,
      },
    });
    logger.verbose(`Created index ${name}`);
    return true;
  }
  return false;
}

export async function ensureIndices(wipeData: boolean) {
  if (wipeData) {
    await clearIndices();
  }

  const buildIndexMap: Record<string, () => Promise<void>> = {
    scenes: buildSceneIndex,
    actors: buildActorIndex,
    images: buildImageIndex,
    studios: buildStudioIndex,
    movies: buildMovieIndex,
    markers: buildMarkerIndex,
  };

  const indicesToBuild = (
    await mapAsync(Object.keys(indexMap), async (indexKey) => {
      const created = await ensureIndexExists(indexMap[indexKey]);
      return created ? indexKey : "";
    })
  ).filter(Boolean);

  for (const indexKey of indicesToBuild) {
    await buildIndexMap[indexKey]();
  }
}
