import { Router } from "express";

import { configFile, getConfig } from "../config";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    location: configFile,
    value: getConfig(),
  });
});

export default router;
