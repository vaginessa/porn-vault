import { Router } from "express";

import { getConfig } from "../config/index";
import { isScanning, nextScanTimestamp, scanFolders } from "../scanner";
import * as logger from "../utils/logger";

const router = Router();

router.post("/", (req, res) => {
  if (isScanning) {
    res.status(409).json("Scan already in progress");
  } else {
    const config = getConfig();
    scanFolders(config.scan.interval).catch((err: Error) => {
      logger.error(err.message);
    });
    res.json("Started scan.");
  }
});

router.get("/", (req, res) => {
  res.json({
    isScanning,
    nextScanDate: nextScanTimestamp ? new Date(nextScanTimestamp).toLocaleString() : null,
    nextScanTimestamp,
  });
});

export default router;
