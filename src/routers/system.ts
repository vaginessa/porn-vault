import axios from "axios";
import { Router } from "express";
import { uptime } from "os";

import { exitIzzy, izzyVersion } from "../binaries/izzy";
import {
  collectionBuildInfoMap,
  CollectionBuildStatus,
  collectionDefinitions,
  collections,
  formatCollectionName,
} from "../database";
import { ensureIndices, getClient, indexBuildInfoMap, IndexBuildStatus, indexMap } from "../search";
import { setServerStatus, vault } from "../server";
import { statAsync } from "../utils/fs/async";
import { handleError, logger } from "../utils/logger";
import { libraryPath } from "../utils/path";

enum ServiceStatus {
  Unknown = "unknown",
  Disconnected = "disconnected",
  Stopped = "stopped",
  Connected = "connected",
}

const router = Router();

router.get("/status/simple", (req, res) => {
  res.json({
    serverReady: vault?.serverReady || false,
    setupMessage: vault?.setupMessage || "",
  });
});

router.get("/status/full", async (req, res) => {
  let izzyStatus = ServiceStatus.Unknown;
  let iVersion = "unknown";

  const izzyPromise = new Promise<void>((resolve) =>
    (async () => {
      try {
        iVersion = await izzyVersion();
        izzyStatus = ServiceStatus.Connected;
      } catch (err) {
        handleError("Error getting Izzy info", err);
        if (!axios.isAxiosError(err)) {
          izzyStatus = ServiceStatus.Unknown;
        } else if (err.response) {
          izzyStatus = ServiceStatus.Disconnected;
        } else {
          izzyStatus = ServiceStatus.Stopped;
        }
      }
      resolve();
    })()
  );

  const izzyCollections: { name: string; count: number; size: number }[] = [];
  const izzyCollectionsPromise = new Promise<void>((resolve) =>
    (async () => {
      try {
        const collectionInfoPromises = Object.values(collectionDefinitions).map(
          async (collectionDef): Promise<void> => {
            const name = formatCollectionName(collectionDef.name);
            if (collectionBuildInfoMap[collectionDef.key].status === CollectionBuildStatus.None) {
              izzyCollections.push({
                name,
                count: 0,
                size: 0,
              });
              return;
            }

            const count = await collections[collectionDef.key].count();
            const stats = await statAsync(libraryPath(collectionDef.path));
            izzyCollections.push({
              name,
              count,
              size: stats.size,
            });
          }
        );
        await Promise.all(collectionInfoPromises);
        izzyCollections.sort((a, b) => a.name.localeCompare(b.name));
      } catch (err) {
        handleError("Error getting Izzy collections info", err);
      }
      resolve();
    })()
  );

  let esStatus = ServiceStatus.Unknown;
  let esVersion = "unknown";

  const esInfoPromise = new Promise<void>((resolve) =>
    (async () => {
      try {
        const info = (await getClient().info({})) as { version: { number: string } };
        esVersion = info.version.number;
        esStatus = ServiceStatus.Connected;
      } catch (err) {
        handleError("Error getting Elasticsearch info", err);
        if (!axios.isAxiosError(err)) {
          esStatus = ServiceStatus.Unknown;
        } else if (err.response) {
          esStatus = ServiceStatus.Disconnected;
        } else {
          esStatus = ServiceStatus.Stopped;
        }
      }
      resolve();
    })()
  );

  let esIndices: { index: string }[] = [];

  const esIndicesPromise = new Promise<void>((resolve) =>
    (async () => {
      try {
        const indices = Object.values(indexMap);
        if (
          indices.some((indexName) => indexBuildInfoMap[indexName].status === IndexBuildStatus.None)
        ) {
          esIndices = [];
          return resolve();
        }

        esIndices = (await getClient().cat.indices({
          index: indices,
          format: "json",
        })) as {
          health: string;
          status: string;
          index: string;
          uuid: string;
          pri: string;
          rep: string;
          "docs.count": string;
          "docs.deleted": string;
          "store.size": string;
          "pri.store.size": string;
        }[];
        esIndices.sort((a, b) => a.index.localeCompare(b.index));
      } catch (err) {
        handleError("Error getting Elasticsearch indices info", err);
      }
      resolve();
    })()
  );

  await Promise.all([izzyPromise, izzyCollectionsPromise, esInfoPromise, esIndicesPromise]);

  const serverUptime = process.uptime();
  const osUptime = uptime();

  res.json({
    izzy: {
      status: izzyStatus,
      version: iVersion,
      collections: izzyCollections,
      collectionBuildInfoMap, // load progress
      allCollectionsBuilt: Object.keys(collections).every(
        (collectionKey) =>
          collectionBuildInfoMap[collectionKey].status === CollectionBuildStatus.Ready
      ),
    },
    elasticsearch: {
      status: esStatus,
      version: esVersion,
      indices: esIndices, // raw status of indices
      indexBuildInfoMap, // build progress
      allIndexesBuilt: Object.values(indexMap).every(
        (indexName) => indexBuildInfoMap[indexName].status === IndexBuildStatus.Ready
      ),
    },
    // Other
    serverUptime,
    osUptime,
    serverReady: vault?.serverReady || false,
    setupMessage: vault?.setupMessage || "",
  });
});

router.post("/exit", async (req, res) => {
  res.status(200).send("Exiting...");

  const stopIzzy = req.body as { stopIzzy?: boolean };

  logger.info(`Exiting porn-vault. Will ${stopIzzy ? "exit Izzy" : "keep Izzy running"}.`);
  setServerStatus(false, "Exiting...");

  if (stopIzzy) {
    await exitIzzy().catch((err) => {
      handleError("Error exiting izzy", err);
    });
  }

  process.exit(0);
});

router.post("/reindex", async (req, res) => {
  res.status(200).send("Reindexing...");
  try {
    logger.info("Reindexing...");
    setServerStatus(false, "Loading search engine...");

    await ensureIndices(true);

    setServerStatus(true, "Ready");
  } catch (err) {
    handleError("Error reindexing from user request", err);
  }
});

export default router;
