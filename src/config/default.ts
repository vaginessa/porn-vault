import { platform } from "os";

import {
  ApplyActorLabelsEnum,
  ApplyStudioLabelsEnum,
  IConfig,
  StringMatcherType,
  WordMatcherType,
} from "./schema";

export const DEFAULT_STRING_MATCHER: StringMatcherType = {
  type: "legacy",
  options: { ignoreSingleNames: true },
};

export const DEFAULT_WORD_MATCHER: WordMatcherType = {
  type: "word",
  options: {
    ignoreSingleNames: false,
    ignoreDiacritics: true,
    enableWordGroups: true,
    wordSeparatorFallback: true,
    camelCaseWordGroups: true,
    overlappingMatchPreference: "longest",
    groupSeparators: ["[\\s',()[\\]{}*\\.]"],
    wordSeparators: ["[-_]"],
    filepathSeparators: ["[/\\\\&]"],
  },
};

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
      ApplyActorLabelsEnum.enum["event:actor:create"],
      ApplyActorLabelsEnum.enum["plugin:actor:create"],
      ApplyActorLabelsEnum.enum["event:scene:create"],
      ApplyActorLabelsEnum.enum["plugin:scene:create"],
      ApplyActorLabelsEnum.enum["event:image:create"],
    ],
    applySceneLabels: true,
    applyStudioLabels: [
      ApplyStudioLabelsEnum.enum["event:studio:create"],
      ApplyStudioLabelsEnum.enum["plugin:studio:create"],
      ApplyStudioLabelsEnum.enum["event:scene:create"],
      ApplyStudioLabelsEnum.enum["plugin:scene:create"],
    ],
    extractSceneActorsFromFilepath: true,
    extractSceneLabelsFromFilepath: true,
    extractSceneMoviesFromFilepath: true,
    extractSceneStudiosFromFilepath: true,
    matcher: DEFAULT_WORD_MATCHER,
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
