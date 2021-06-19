export const EVENTS = {
  actorCreated: { key: "actorCreated", label: "Actor - actor created" },
  actorCustom: { key: "actorCustom", label: "Actor - user triggers plugins" },
  movieCreated: { key: "movieCreated", label: "Movie - movie created" },
  movieCustom: { key: "movieCustom", label: "Movie - user triggers plugins" },
  sceneCreated: { key: "sceneCreated", label: "Scene - scene created" },
  sceneCustom: { key: "sceneCustom", label: "Scene - user triggers plugins" },
  studioCreated: { key: "studioCreated", label: "Studio - studio created" },
  studioCustom: { key: "studioCustom", label: "Studio - user triggers plugins" },
};

export const GLOBAL_SETTINGS_MAP = {
  allowSceneThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite scene thumbnail",
    },
  },
  allowActorThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite actor images",
    },
  },
  allowMovieThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite movie images",
    },
  },
  allowStudioThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite studio thumbnail",
    },
  },
  createMissingActors: {
    type: "boolean",
    props: {
      label: "Create actors returned from plugins when not found in library",
    },
  },
  createMissingStudios: {
    type: "boolean",
    props: {
      label: "Create studios returned from plugins when not found in library",
    },
  },
  createMissingLabels: {
    type: "boolean",
    props: {
      label: "Create labels returned from plugins when not found in library",
    },
  },
  createMissingMovies: {
    type: "boolean",
    props: {
      label: "Create movies returned from plugins when not found in library",
    },
  },
  markerDeduplicationThreshold: {
    type: "number",
    props: {
      label: "Threshold in which new markers will be ignored",
      suffix: "s",
    },
  },
};

export const PLUGIN_EXTENSIONS = [".js", ".ts"];
