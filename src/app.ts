import express from "express";
import { existsSync } from "fs";
import https, { ServerOptions } from "https";
import LRU from "lru-cache";
import moment from "moment";
import * as path from "path";

import BROKEN_IMAGE from "./data/broken_image";
import { sceneCollection } from "./database";
import { mountApolloServer } from "./middlewares/apollo";
import cors from "./middlewares/cors";
import { checkPassword, passwordHandler } from "./middlewares/password";
import queueRouter from "./queue_router";
import mediaRouter from "./routers/media";
import scanRouter from "./routers/scan";
import { applyPublic } from "./static";
import Actor from "./types/actor";
import Scene, { runFFprobe } from "./types/scene";
import SceneView from "./types/watch";
import { httpLog } from "./utils/logger";
import * as logger from "./utils/logger";
import { createObjectSet } from "./utils/misc";
import { renderHandlebars } from "./utils/render";
import VERSION from "./version";

export class Vault {
  private app: express.Application;
  private _close: (() => void) | null = null;
  public serverReady = false;
  public setupMessage = "Setting up...";

  constructor(app: express.Application) {
    this.app = app;
  }

  /**
   *
   * @param port - the port to start listening on
   * @param httpsOpts - https options. If given, will start an https server with these options
   * @returns promise that resolves once the server starts listening
   */
  public async startServer(port: number, httpsOpts: ServerOptions | null = null): Promise<void> {
    return new Promise((resolve) => {
      if (httpsOpts) {
        const server = https.createServer(httpsOpts, this.app).listen(port, resolve);
        this._close = () => {
          server.close();
        };
      } else {
        const server = this.app.listen(port, resolve);
        this._close = () => {
          server.close();
        };
      }
    });
  }

  /**
   * Closes the server that was started in `startServer`
   */
  public close(): void {
    if (this._close) {
      this._close();
    }
  }
}

export function createVault(): Vault {
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

  applyPublic(app);

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

  app.use("/media", mediaRouter);

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

  app.use("/scan", scanRouter);

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
