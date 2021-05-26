import axios from "axios";
import { Router } from "express";
import { uptime } from "os";

import { exitIzzy, izzyVersion } from "../binaries/izzy";
import { ensureIndices, getClient } from "../search";
import { setServerStatus } from "../server";
import { handleError, logger } from "../utils/logger";

enum ServiceStatus {
  Unknown = "unknown",
  Disconnected = "disconnected",
  Stopped = "stopped",
  Connected = "connected",
}

const router = Router();

router.get("/status", async (req, res) => {
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

  const esPromise = new Promise<void>((resolve) =>
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

  await Promise.all([izzyPromise, esPromise]);

  const serverUptime = process.uptime();
  const osUptime = uptime();

  res.json({
    izzyStatus,
    izzyVersion: iVersion,
    esStatus,
    esVersion,
    serverUptime,
    osUptime,
  });
});

router.post("/exit", async (req, res) => {
  res.status(200).end();

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
  res.status(200).end();
  try {
    logger.info("Reindexing...");
    setServerStatus(false, "Loading search engine...");

    await ensureIndices(true);

    setServerStatus(true);
  } catch (err) {
    handleError("Error reindexing from user request", err);
  }
});

export default router;
