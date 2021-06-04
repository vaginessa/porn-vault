import express from "express";
import https, { ServerOptions } from "https";
import LRU from "lru-cache";
import moment from "moment";
const { loadNuxt, Builder } = require("nuxt");

import { readdirAsync, statAsync } from "./utils/fs/async";
import { sceneCollection } from "./database";
import { mountApolloServer } from "./middlewares/apollo";
import cors from "./middlewares/cors";
/* import { checkPassword, passwordHandler } from "./middlewares/password"; */
import queueRouter from "./queue_router";
import mediaRouter from "./routers/media";
import scanRouter from "./routers/scan";
import { applyPublic } from "./static";
import Actor from "./types/actor";
import Scene from "./types/scene";
import SceneView from "./types/watch";
import { httpLog, logger } from "./utils/logger";
import { createObjectSet } from "./utils/misc";
import VERSION from "./version";
import { resolve, parse } from "path";
import { statSync } from "fs";

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

export async function createVault(): Promise<Vault> {
  const statCache = new LRU({
    max: 100,
    maxAge: 1000 * 60 /* 1 minute */,
  });

  const app = express();
  const vault = new Vault(app);
  app.use(express.json());
  app.use(cors);

  app.use(httpLog);

  app.get("/api/version", (_req, res) => {
    res.json({
      result: VERSION,
    });
  });

  app.get("/api/label-usage/scenes", async (_req, res) => {
    const cached = statCache.get("scene-label-usage");
    if (cached) {
      logger.debug("Using cached scene label usage");
      return res.json(cached);
    }
    const scores = await Scene.getLabelUsage();
    if (scores.length) {
      logger.debug("Caching scene label usage");
      statCache.set("scene-label-usage", scores);
    }
    res.json(scores);
  });

  app.get("/api/label-usage/actors", async (_req, res) => {
    const cached = statCache.get("actor-label-usage");
    if (cached) {
      logger.debug("Using cached actor label usage");
      return res.json(cached);
    }
    const scores = await Actor.getLabelUsage();
    if (scores.length) {
      logger.debug("Caching actor label usage");
      statCache.set("actor-label-usage", scores);
    }
    res.json(scores);
  });

  app.get("/api/setup", (_req, res) => {
    res.json({
      serverReady: vault.serverReady,
      setupMessage: vault.setupMessage,
    });
  });

  applyPublic(app);

  /* app.get("/api/password", checkPassword);
  app.use(passwordHandler); */

  app.use("/api/media", mediaRouter);

  /* app.get("/log", (req, res) => {
    res.json(getLog());
  }); */

  mountApolloServer(app);

  app.use("/api/queue", queueRouter);

  app.get("/api/remaining-time", async (_req, res) => {
    const views = createObjectSet(await SceneView.getAll(), "scene");
    if (!views.length) {
      return res.json(null);
    }

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

  app.use("/api/scan", scanRouter);

  app.use("/api/browse", async (req, res) => {
    try {
      let path = resolve(String(req.query.path || process.cwd()));

      if (!statSync(path).isDirectory()) {
        path = parse(path).dir;
      }

      const files: {
        name: string;
        path: string;
        size: number;
        createdOn: number;
        dir: boolean;
      }[] = [];

      const entries = await readdirAsync(path);

      for (const entry of entries) {
        const filePath = resolve(path, entry);
        const stats = await statAsync(filePath);
        files.push({
          name: entry,
          path: filePath,
          size: stats.size,
          createdOn: stats.mtimeMs,
          dir: stats.isDirectory(),
        });
      }

      const parentFolder = resolve(path, "..");
      const hasParentFolder = path !== parentFolder;

      res.json({
        path,
        files,
        parentFolder: hasParentFolder ? parentFolder : null,
      });
    } catch (error) {
      res.sendStatus(500);
    }
  });

  logger.verbose(`Loading page renderer`);
  const isDev = process.env.NODE_ENV !== "production";
  const nuxt = await loadNuxt(isDev ? "dev" : "start");
  await nuxt.ready();

  if (isDev) {
    logger.info(`Dev: Building page`);
    const builder = new Builder(nuxt);
    await builder.build();
  }

  // Nuxt also serves as error handler for any uncaught route
  app.use(nuxt.render);

  return vault;
}
