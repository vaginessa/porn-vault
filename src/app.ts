import express from "express";
import https, { ServerOptions } from "https";
import LRU from "lru-cache";
import moment from "moment";
import { resolve } from "path";
import { createPageRenderer } from "vite-plugin-ssr";

import { collections } from "./database";
import { mountApolloServer } from "./middlewares/apollo";
import cors from "./middlewares/cors";
import { checkPassword, passwordHandler } from "./middlewares/password";
import queueRouter from "./queue_router";
import configRouter from "./routers/config";
import mediaRouter from "./routers/media";
import scanRouter from "./routers/scan";
import systemRouter from "./routers/system";
import { applyPublic } from "./static";
import Actor from "./types/actor";
import Scene from "./types/scene";
import SceneView from "./types/watch";
import { handleError, httpLog, logger } from "./utils/logger";
import { createObjectSet } from "./utils/misc";
import VERSION from "./version";

const isProduction = process.env.NODE_ENV !== "development";

const locales = ['en', 'de', 'fr'];
const localeDefault = locales[0];

function extractLocale(url: string) {
  const urlPaths = url.split('/');

  let locale;
  let urlWithoutLocale;
  
  // We remove the URL locale, for example `/de/about` => `/about`
  const firstPath = urlPaths[1];
  if (locales.filter((locale) => locale !== localeDefault).includes(firstPath)) {
    locale = firstPath;
    urlWithoutLocale = '/' + urlPaths.slice(2).join('/');
  } else {
    locale = localeDefault;
    urlWithoutLocale = url;
  }

  return { locale, urlWithoutLocale };
}

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

  applyPublic(app);

  // Allow access to these apis before "serverReady"
  app.get("/api/password", checkPassword);
  app.use(passwordHandler);
  app.use("/api/system", systemRouter);
  app.use("/api/config", configRouter);
  app.get("/api/version", (req, res) => {
    res.json({
      result: VERSION,
    });
  });

  app.use("/api", (req, res, next) => {
    if (vault.serverReady) {
      next();
    } else {
      res.redirect("/");
    }
  });

  app.get("/api/label-usage/scenes", async (req, res) => {
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

  app.get("/api/label-usage/actors", async (req, res) => {
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

  app.use("/api/media", mediaRouter);

  /* app.get("/log", (req, res) => {
    res.json(getLog());
  }); */

  mountApolloServer(app);

  app.use("/api/queue", queueRouter);

  app.get("/api/remaining-time", async (_req, res) => {
    const views = createObjectSet(await SceneView.getAll(), "scene");
    if (!views.length) return res.json(null);

    const now = Date.now();
    const numScenes = await collections.scenes.count();
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

  const root = process.cwd();
  let viteDevServer;

  if (isProduction) {
    app.use(express.static(resolve("dist/client")));
  } else {
    logger.warn("Starting dev renderer");
    const vite = require("vite");
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: "ssr" },
    });
    app.use(viteDevServer.middlewares);
  }

  logger.debug("Creating renderer");
  const renderPage = createPageRenderer({ viteDevServer, isProduction, root });
  app.get("*", async (req, res, next) => {
    let url = req.originalUrl;

    const { urlWithoutLocale, locale } = extractLocale(url);
    url = urlWithoutLocale;

    const pageContextInit = {
      url,
      locale,
    };
    
    const pageContext = await renderPage(pageContextInit);

    const { httpResponse } = pageContext;
    if (!httpResponse) {
      return next();
    }

    const stream = await httpResponse.getNodeStream();
    const { statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType);
    stream.pipe(res);
  });

  // Error handler
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: number, req: express.Request, res: express.Response, next: express.NextFunction) => {
      handleError(`Unknown error in middleware from url ${req.path}`, err);
      if (typeof err === "number") return res.sendStatus(err);
      return res.sendStatus(500);
    }
  );

  return vault;
}
