import axios from "axios";
import { Router } from "express";

import { izzyVersion } from "../binaries/izzy";
import { getClient } from "../search";
import { handleError } from "../utils/logger";

const router = Router();

router.get("/status", async (req, res) => {
  let iVersion = "unknown";
  let izzyStatus = "unknown";

  try {
    iVersion = await izzyVersion();
    izzyStatus = "connected";
  } catch (err) {
    handleError("Error getting Izzy info", err);
    if (!axios.isAxiosError(err)) {
      izzyStatus = "unknown";
    } else if (err.response) {
      izzyStatus = "disconnected";
    } else {
      izzyStatus = "stopped";
    }
  }

  let esVersion = "unknown";
  let esStatus = "unknown";
  try {
    const info = (await getClient().info({})) as { version: { number: string } };
    esVersion = info.version.number;
    esStatus = "connected";
  } catch (err) {
    handleError("Error getting Elasticsearch info", err);
    if (!axios.isAxiosError(err)) {
      esStatus = "unknown";
    } else if (err.response) {
      esStatus = "disconnected";
    } else {
      esStatus = "stopped";
    }
  }

  res.json({
    izzyStatus,
    izzyVersion: iVersion,
    esStatus,
    esVersion,
  });
});

export default router;
