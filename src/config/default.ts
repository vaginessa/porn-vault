// TODO: default config

import { IConfig } from "./schema";

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

const defaultConfig: IConfig = {};

export default defaultConfig;
