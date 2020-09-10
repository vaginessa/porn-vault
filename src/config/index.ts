import chokidar from "chokidar";
import { existsSync } from "fs";
import inquirer from "inquirer";
import path from "path";
import YAML from "yaml";
import * as zod from "zod";

import { onConfigLoad } from "..";
import { readFileAsync, writeFileAsync } from "../fs/async";
import * as logger from "../logger";
import setupFunction from "../setup";

enum ConfigFileFormat {
  JSON = "JSON",
  YAML = "YAML",
}

function stringifyFormatted<T>(obj: T, format: ConfigFileFormat): string {
  switch (format) {
    case ConfigFileFormat.JSON:
      return JSON.stringify(obj, null, 2);
    case ConfigFileFormat.YAML:
      return YAML.stringify(obj);
    default:
      return "";
  }
}

/* interface IPlugin {
  path: string;
  args?: Dictionary<unknown>;
}

type PluginCallWithArgument = [string, Dictionary<unknown>]; */

const pluginSchema = zod.object({
  path: zod.string(),
  args: zod.record(zod.any()),
});

const configSchema = zod.object({
  import: zod.object({
    videos: zod.array(zod.string()),
    images: zod.array(zod.string()),
    bulk: zod.array(zod.string()),
  }),

  scan: zod.object({
    scanOnStartup: zod.boolean(),
    interval: zod.number().min(0),
    excludeFiles: zod.array(zod.string()),
  }),

  processing: zod.object({
    doProcessing: zod.boolean(),
    generateScreenshots: zod.boolean(),
    generatePreviews: zod.boolean(),
    screenshotInterval: zod.number().min(0),
    readImagesOnImport: zod.boolean(),
    imageCompressionSize: zod.number().min(60),
  }),

  persistence: zod.object({
    libraryPath: zod.string(),

    backup: zod.object({
      enable: zod.boolean(),
      maxAmount: zod.number().min(0),
    }),
  }),

  binaries: zod.object({
    ffmpeg: zod.string(),
    ffprobe: zod.string(),

    izzyPort: zod.number().min(1).max(65535),
    giannaPort: zod.number().min(1).max(65535),
  }),

  auth: zod.object({
    password: zod.string().nullable(),
  }),

  server: zod.object({
    port: zod.number().min(1).max(65535),

    https: zod.object({
      enable: zod.boolean(),
      key: zod.string().nullable(),
      certificate: zod.string().nullable(),
    }),
  }),

  matching: zod.object({
    applySceneLabels: zod.boolean(),
    applyActorLabels: zod.boolean(),
    applyStudioLabels: zod.boolean(),
  }),
  plugins: zod.object({
    register: zod.record(pluginSchema),
    events: zod.record(zod.string() /* TODO: plugin call with arg*/),

    allowSceneThumbnailOverwrite: zod.boolean(),
    allowActorThumbnailOverwrite: zod.boolean(),
    allowMovieThumbnailOverwrite: zod.boolean(),

    createMissingActors: zod.boolean(),
    createMissingStudios: zod.boolean(),
    createMissingLabels: zod.boolean(),
    createMissingMovies: zod.boolean(),
  }),
  log: zod.object({
    maxSize: zod.number().min(0),
  }),
});

type IPlugin = zod.TypeOf<typeof pluginSchema>;
type IConfig = zod.TypeOf<typeof configSchema>;

export function isValidConfig(val: unknown) {
  try {
    return configSchema.parse(val);
  } catch (error) {
    return null;
  }
}

/* export const defaultConfig: IConfig = {
  VIDEO_PATHS: [],
  IMAGE_PATHS: [],

  BULK_IMPORT_PATHS: [],

  SCAN_ON_STARTUP: false,
  DO_PROCESSING: true,
  SCAN_INTERVAL: 10800000,
  LIBRARY_PATH: process.cwd(),
  FFMPEG_PATH: "",
  FFPROBE_PATH: "",
  GENERATE_SCREENSHOTS: false,
  GENERATE_PREVIEWS: true,
  SCREENSHOT_INTERVAL: 120,
  PASSWORD: null,
  PORT: 3000,
  IZZY_PORT: 8000,
  GIANNA_PORT: 8001,
  ENABLE_HTTPS: false,
  HTTPS_KEY: "",
  HTTPS_CERT: "",
  APPLY_SCENE_LABELS: true,
  APPLY_ACTOR_LABELS: true,
  APPLY_STUDIO_LABELS: true,
  READ_IMAGES_ON_IMPORT: false,
  BACKUP_ON_STARTUP: true,
  MAX_BACKUP_AMOUNT: 10,
  EXCLUDE_FILES: [],
  PLUGINS: {},
  PLUGIN_EVENTS: {
    actorCreated: [],
    sceneCreated: [],
    actorCustom: [],
    sceneCustom: [],
    movieCreated: [],
  },
  CREATE_MISSING_ACTORS: false,
  CREATE_MISSING_STUDIOS: false,
  CREATE_MISSING_LABELS: false,
  CREATE_MISSING_MOVIES: false,

  ALLOW_PLUGINS_OVERWRITE_SCENE_THUMBNAILS: false,
  ALLOW_PLUGINS_OVERWRITE_ACTOR_THUMBNAILS: false,
  ALLOW_PLUGINS_OVERWRITE_MOVIE_THUMBNAILS: false,

  MAX_LOG_SIZE: 2500,

  COMPRESS_IMAGE_SIZE: 720,

  CACHE_TIME: 0,
}; */

let loadedConfig: IConfig | null;
let loadedConfigFormat: ConfigFileFormat | null = null;
export let configFile: string;

const configFilename = process.env.NODE_ENV === "test" ? "config.test" : "config";

const configJSONFilename = path.resolve(process.cwd(), `${configFilename}.json`);
const configYAMLFilename = path.resolve(process.cwd(), `${configFilename}.yaml`);

export async function checkConfig(): Promise<undefined> {
  const hasReadFile = await loadConfig();

  if (hasReadFile && loadedConfigFormat) {
    let defaultOverride = false;
    for (const key in defaultConfig) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (loadedConfig![key] === undefined) {
        // eslint-disable-next-line
        loadedConfig![key] = defaultConfig[key];
        defaultOverride = true;
      }
    }

    if (defaultOverride) {
      await writeFileAsync(
        configFile,
        stringifyFormatted(loadedConfig, loadedConfigFormat),
        "utf-8"
      );
    }
    return;
  }

  const yaml =
    process.env.NODE_ENV === "test"
      ? false
      : (
          await inquirer.prompt<{ yaml: boolean }>([
            {
              type: "confirm",
              name: "yaml",
              message: "Use YAML (instead of JSON) for config file?",
              default: false,
            },
          ])
        ).yaml;

  loadedConfig = await setupFunction();

  if (yaml) {
    await writeFileAsync(
      configYAMLFilename,
      stringifyFormatted(loadedConfig, ConfigFileFormat.YAML),
      "utf-8"
    );
    logger.warn(`Created ${configYAMLFilename}. Please edit and restart.`);
  } else {
    await writeFileAsync(
      configJSONFilename,
      stringifyFormatted(loadedConfig, ConfigFileFormat.JSON),
      "utf-8"
    );
    logger.warn(`Created ${configJSONFilename}. Please edit and restart.`);
  }

  return process.exit(0);
}

export async function loadConfig(): Promise<boolean> {
  try {
    if (existsSync(configJSONFilename)) {
      logger.message(`Loading ${configJSONFilename}...`);
      loadedConfig = JSON.parse(await readFileAsync(configJSONFilename, "utf-8")) as IConfig;
      configFile = configJSONFilename;
      loadedConfigFormat = ConfigFileFormat.JSON;
      return true;
    } else if (existsSync(configYAMLFilename)) {
      logger.message(`Loading ${configYAMLFilename}...`);
      loadedConfig = YAML.parse(await readFileAsync(configYAMLFilename, "utf-8")) as IConfig;
      configFile = configYAMLFilename;
      loadedConfigFormat = ConfigFileFormat.YAML;
      return true;
    } else {
      logger.warn("Did not find any config file");
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }

  return false;
}

export function getConfig(): IConfig {
  return loadedConfig as IConfig;
}

/**
 * @returns a function that will stop watching the config file
 */
export function watchConfig(): () => Promise<void> {
  const watcher = chokidar.watch(configFile).on("change", async () => {
    logger.message(`${configFile} changed, reloading...`);

    let newConfig = null as IConfig | null;

    try {
      if (configFile.endsWith(".json")) {
        newConfig = JSON.parse(await readFileAsync(configJSONFilename, "utf-8")) as IConfig;
        loadedConfigFormat = ConfigFileFormat.JSON;
      } else if (configFile.endsWith(".yaml")) {
        newConfig = YAML.parse(await readFileAsync(configYAMLFilename, "utf-8")) as IConfig;
        loadedConfigFormat = ConfigFileFormat.YAML;
      }
    } catch (error) {
      logger.error(error);
      logger.error("ERROR when loading new config, please fix it.");
    }

    if (newConfig) {
      loadedConfig = newConfig;
      onConfigLoad(loadedConfig);
    } else {
      logger.warn("Couldn't load config, try again");
    }
  });

  return async (): Promise<void> => watcher.close();
}

export function resetLoadedConfig(): void {
  loadedConfig = null;
}
