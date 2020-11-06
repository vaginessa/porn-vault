import { platform } from "os";

import { IConfig } from "./schema";

function isWindows(): boolean {
  return platform() === "win32";
}

function exeName(str: string): string {
  return `${str}${isWindows() ? ".exe" : ""}`;
}

const defaultConfig: IConfig = {
  auth: {
    password: null,
  },
  binaries: {
    ffmpeg: exeName("ffmpeg"),
    ffprobe: exeName("ffprobe"),
    izzyPort: 8000,
    giannaPort: 8001,
  },
  import: {
    images: [],
    videos: [],
  },
  log: {
    maxSize: 2500,
  },
  matching: {
    applyActorLabels: [
      "actorCreate",
      "actorPluginCreated",
      "sceneCreate",
      "scenePluginCreated",
      "imageCreate",
    ],
    applySceneLabels: true,
    applyStudioLabels: ["studioCreate", "studioPluginCreated", "sceneCreate", "imageCreate"],
    extractSceneActorsFromFilepath: true,
    extractSceneLabelsFromFilepath: true,
    extractSceneMoviesFromFilepath: true,
    extractSceneStudiosFromFilepath: true,
  },
  persistence: {
    backup: {
      enable: true,
      maxAmount: 10,
    },
    libraryPath: process.cwd(),
  },
  plugins: {
    allowActorThumbnailOverwrite: false,
    allowMovieThumbnailOverwrite: false,
    allowSceneThumbnailOverwrite: false,
    allowStudioThumbnailOverwrite: false,
    createMissingActors: false,
    createMissingLabels: false,
    createMissingMovies: false,
    createMissingStudios: false,
    events: {
      actorCreated: [],
      actorCustom: [],
      sceneCreated: [],
      sceneCustom: [],
      movieCustom: [],
      studioCreated: [],
      studioCustom: [],
    },
    register: {},
  },
  processing: {
    doProcessing: true,
    generatePreviews: true,
    generateScreenshots: false,
    imageCompressionSize: 720,
    readImagesOnImport: false,
    screenshotInterval: 120,
    generateImageThumbnails: true,
  },
  scan: {
    excludeFiles: [],
    interval: 10800000,
    scanOnStartup: true,
  },
  server: {
    https: {
      certificate: "",
      enable: false,
      key: "",
    },
    port: 3000,
  },
};

export default defaultConfig;
