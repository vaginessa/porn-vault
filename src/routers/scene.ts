import { Router } from "express";
import path from "path";

import Scene from "../types/scene";

export enum SceneStreamTypes {
  DIRECT = "direct",
  MP4 = "mp4",
  MKV = "mkv",
  WEBM = "webm",
}

const router = Router();

router.get("/:scene", async (req, res, next) => {
  const scene = await Scene.getById(req.params.scene);

  if (scene && scene.path) {
    const resolved = path.resolve(scene.path);
    res.sendFile(resolved);
  } else next(404);
});

export default router;
