import axios from "axios";
import { Router } from "express";
import { uptime } from "os";

import { exitIzzy, izzyVersion } from "../binaries/izzy";
import { ensureIndices, getClient, indexBuildInfoMap, IndexBuildStatus, indexMap } from "../search";
import { setServerStatus, vault } from "../server";
import { handleError, logger } from "../utils/logger";

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

  let esIndices: any[] = [];

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
      } catch (err) {
        handleError("Error getting Elasticsearch indices info", err);
      }
      resolve();
    })()
  );

  await Promise.all([izzyPromise, esInfoPromise, esIndicesPromise]);

  const serverUptime = process.uptime();
  const osUptime = uptime();

  res.json({
    // Izzy
    izzyStatus,
    izzyVersion: iVersion,
    izzyLoaded: true, // TODO:
    // ES
    esStatus,
    esVersion,
    esIndices, // raw status of indices
    indexBuildInfoMap, // build progress
    allIndexesBuilt: Object.values(indexMap).every(
      (indexName) => indexBuildInfoMap[indexName].status === IndexBuildStatus.Ready
    ),
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
