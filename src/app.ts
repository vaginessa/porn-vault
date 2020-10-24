import express from "express";
import { existsSync } from "fs";
import LRU from "lru-cache";
import moment from "moment";
import * as path from "path";

import Image from "./types/image";
import { getConfig } from "./config/index";
import cors from "./middlewares/cors";
import Actor from "./types/actor";
import { httpLog } from "./utils/logger";
import { sceneCollection } from "./database/index";
import BROKEN_IMAGE from "./data/broken_image";
import * as logger from "./utils/logger";
import { renderHandlebars } from "./utils/render";
import VERSION from "./version";
import Scene, { runFFprobe } from "./types/scene";
import { dvdRenderer } from "./dvd_renderer";
import { checkPassword, passwordHandler } from "./middlewares/password";
import { mountApolloServer } from "./middlewares/apollo";
import SceneView from "./types/watch";
import { createObjectSet } from "./utils/misc";
import { isScanning, nextScanTimestamp, scanFolders } from "./scanner";
import queueRouter from "./queue_router";

export class Vault {
  app: express.Application;
  close: () => void = () => {};
  serverReady = false;
  setupMessage = "Setting up...";

  constructor(app: express.Application) {
    this.app = app;
  }
}

export function createVault() {
  const config = getConfig();

  const cache = new LRU({
    max: 500,
    maxAge: 3600 * 1000,
  });

  const app = express();
  const vault = new Vault(app);
  app.use(express.json());
  app.use(cors);

  app.use(httpLog);

  app.get("/", async (req, res, next) => {
    if (vault.serverReady) {
      next();
    } else {
      res.status(404).send(
        await renderHandlebars("./views/setup.html", {
          message: vault.setupMessage,
        })
      );
    }
  });

  app.get("/version", (req, res) => {
    res.json({
      result: VERSION,
    });
  });

  app.get("/label-usage/scenes", async (req, res) => {
    const cached = cache.get("scene-label-usage");
    if (cached) {
      logger.log("Using cached scene label usage");
      return res.json(cached);
    }
    const scores = await Scene.getLabelUsage();
    if (scores.length) {
      logger.log("Caching scene label usage");
      cache.set("scene-label-usage", scores);
    }
    res.json(scores);
  });

  app.get("/label-usage/actors", async (req, res) => {
    const cached = cache.get("actor-label-usage");
    if (cached) {
      logger.log("Using cached actor label usage");
      return res.json(cached);
    }
    const scores = await Actor.getLabelUsage();
    if (scores.length) {
      logger.log("Caching actor label usage");
      cache.set("actor-label-usage", scores);
    }
    res.json(scores);
  });

  app.get("/setup", (req, res) => {
    res.json({
      serverReady: vault.serverReady,
      setupMessage: vault.setupMessage,
    });
  });

  app.get("/broken", (_, res) => {
    const b64 = BROKEN_IMAGE;

    const img = Buffer.from(b64, "base64");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });
    res.end(img);
  });

  app.use("/js", express.static("./app/dist/js"));
  app.use("/css", express.static("./app/dist/css"));
  app.use("/fonts", express.static("./app/dist/fonts"));
  app.use("/previews", express.static("./library/previews"));
  app.use("/assets", express.static("./assets"));
  app.get("/dvd-renderer/:id", dvdRenderer);
  app.get("/flag/:code", (req, res) => {
    res.redirect(`/assets/flags/${req.params.code.toLowerCase()}.svg`);
  });

  app.get("/password", checkPassword);
  app.use(passwordHandler);

  app.get("/", async (req, res) => {
    const file = path.join(process.cwd(), "app/dist/index.html");

    if (existsSync(file)) res.sendFile(file);
    else {
      return res.status(404).send(
        await renderHandlebars("./views/error.html", {
          code: 404,
          message: `File <b>${file}</b> not found`,
        })
      );
    }
  });

  app.get("/scene/:scene", async (req, res, next) => {
    const scene = await Scene.getById(req.params.scene);

    if (scene && scene.path) {
      const resolved = path.resolve(scene.path);
      res.sendFile(resolved);
    } else next(404);
  });

  app.get("/image/path/:path", async (req, res) => {
    const pathParam = (req.query as Record<string, string>).path;
    if (!pathParam) return res.sendStatus(400);

    const img = await Image.getImageByPath(pathParam);

    if (!img) return res.sendStatus(404);

    if (img && img.path) {
      const resolved = path.resolve(img.path);
      if (!existsSync(resolved)) res.redirect("/broken");
      else res.sendFile(resolved);
    } else {
      res.sendStatus(404);
    }
  });

  app.get("/image/:image", async (req, res) => {
    const image = await Image.getById(req.params.image);

    if (image && image.path) {
      const resolved = path.resolve(image.path);
      if (!existsSync(resolved)) res.redirect("/broken");
      else res.sendFile(resolved);
    } else res.redirect("/broken");
  });

  app.get("/image/:image/thumbnail", async (req, res) => {
    const image = await Image.getById(req.params.image);

    if (image && image.thumbPath) {
      const resolved = path.resolve(image.thumbPath);
      if (!existsSync(resolved)) {
        res.redirect("/broken");
      } else {
        res.sendFile(resolved);
      }
    } else if (image) {
      const config = getConfig();
      logger.log(`${req.params.image}'s thumbnail does not exist (yet)`);
      res.redirect(`/image/${image._id}?password=${config.auth.password}`);
    } else {
      res.redirect("/broken");
    }
  });

  app.get("/log", (req, res) => {
    res.json(logger.getLog());
  });

  mountApolloServer(app);

  app.use("/queue", queueRouter);

  app.get("/remaining-time", async (_req, res) => {
    const views = createObjectSet(await SceneView.getAll(), "scene");
    if (!views.length) return res.json(null);

    const now = Date.now();
    const numScenes = await sceneCollection.count();
    const viewedPercent = views.length / numScenes;
    const currentInterval = now - views[0].date;
    const fullTime = currentInterval / viewedPercent;
    const remaining = fullTime - currentInterval;
    const remainingTimestamp = now + remaining;
    /* TODO: server side cache result
       clear cache when some scene viewed
    */
    res.json({
      numViews: views.length,
      numScenes,
      viewedPercent,
      remaining,
      remainingSeconds: moment.duration(remaining).asSeconds(),
      remainingDays: moment.duration(remaining).asDays(),
      remainingMonths: moment.duration(remaining).asMonths(),
      remainingYears: moment.duration(remaining).asYears(),
      remainingTimestamp,
      currentInterval,
      currentIntervalDays: moment.duration(currentInterval).asDays(),
    });
  });

  app.post("/scan", (req, res) => {
    if (isScanning) {
      res.status(409).json("Scan already in progress");
    } else {
      scanFolders(config.scan.interval).catch((err: Error) => {
        logger.error(err.message);
      });
      res.json("Started scan.");
    }
  });

  app.get("/scan", (req, res) => {
    res.json({
      isScanning,
      nextScanDate: nextScanTimestamp ? new Date(nextScanTimestamp).toLocaleString() : null,
      nextScanTimestamp,
    });
  });

  app.get("/ffprobe/:scene", async (req, res) => {
    const scene = await Scene.getById(req.params.scene);

    if (!scene || !scene.path) {
      return res.sendStatus(404);
    }

    res.json({
      result: await runFFprobe(scene.path),
    });
  });

  // Error handler
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: number, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (typeof err === "number") return res.sendStatus(err);
      return res.sendStatus(500);
    }
  );

  return vault;
}
