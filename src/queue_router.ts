import { Router } from "express";

import { imageCollection, processingCollection, sceneCollection } from "./database/index";
import { getHead, removeSceneFromQueue } from "./queue/processing";
/* import { indexImages } from "./search/image"; */
import { updateScenes } from "./search/scene";
import Image from "./types/image";
import Scene from "./types/scene";
import * as logger from "./utils/logger";

const router = Router();

router.delete("/:id", async (req, res) => {
  await removeSceneFromQueue(req.params.id);
  res.json(null);
});

router.post("/:id", async (req, res) => {
  await removeSceneFromQueue(req.params.id);
  const scene = await Scene.getById(req.params.id);

  const reqBody = req.body as Record<string, unknown>;

  if (scene) {
    if (reqBody.scene) {
      Object.assign(scene, reqBody.scene);
      logger.log("Merging scene data:", reqBody.scene);
      await sceneCollection.upsert(req.params.id, scene);
      await updateScenes([scene]);
    }
    if (reqBody.images) {
      for (const image of <Image[]>reqBody.images) {
        logger.log("New image!", image);
        await imageCollection.upsert(image._id, image);
        /*  await indexImages([image]); */
        const actors = await Scene.getActors(scene);
        const labels = await Scene.getLabels(scene);
        await Image.setActors(
          image,
          actors.map((a) => a._id)
        );
        await Image.setLabels(
          image,
          labels.map((a) => a._id)
        );
      }
    }
    if (reqBody.thumbs) {
      for (const thumb of <Image[]>reqBody.thumbs) {
        logger.log("New thumbnail!", thumb);
        await imageCollection.upsert(thumb._id, thumb);
      }
    }
  }

  res.json(null);
});

router.get("/head", async (req, res) => {
  let scene: Scene | null = null;

  do {
    const queueHead = await getHead();
    if (!queueHead) {
      return res.json(null);
    }

    scene = await Scene.getById(queueHead._id);
    if (!scene) {
      logger.warn(
        `Scene ${queueHead._id} doesn't exist (anymore?), deleting from processing queue...`
      );
      await processingCollection.remove(queueHead._id);
    }
  } while (!scene && (await processingCollection.count()) > 0);

  res.json(scene);
});

export default router;
