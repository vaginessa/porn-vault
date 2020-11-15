import * as zod from "zod";

const pluginSchema = zod.object({
  path: zod.string(),
  args: zod.record(zod.any()).optional(),
});

export const ApplyActorLabelsEnum = zod.enum([
  "event:actor:create",
  "event:actor:update",
  "plugin:actor:create",
  "plugin:actor:custom",
  "event:scene:create",
  "event:scene:update",
  "plugin:scene:create",
  "plugin:scene:custom",
  "event:image:create",
  "event:image:update",
]);

export const ApplyStudioLabelsEnum = zod.enum([
  "event:studio:create",
  "event:studio:update",
  "plugin:studio:create",
  "plugin:studio:custom",
  "event:scene:create",
  "event:scene:update",
  "plugin:scene:create",
  "plugin:scene:custom",
]);

const StringMatcherOptionsSchema = zod.object({
  ignoreSingleNames: zod.boolean(),
});

export type StringMatcherOptions = zod.TypeOf<typeof StringMatcherOptionsSchema>;

const WordMatcherOptionsSchema = zod.object({
  ignoreSingleNames: zod.boolean(),
  /**
   * If word groups should be flattened, allowing non word groups to match against them.
   * Example: allows "My WordGroup" to match against "My WordGroupExtra"
   */
  flattenWordGroups: zod.boolean(),
  /**
   * When inputs were matched on overlapping words, which one to return.
   * Example: "My Studio", "Second My Studio" both overlap when matched against "second My Studio"
   */
  overlappingInputPreference: zod.enum(["all", "longest", "shortest"]),
});

export type WordMatcherOptions = zod.TypeOf<typeof WordMatcherOptionsSchema>;

const configSchema = zod
  .object({
    import: zod.object({
      videos: zod.array(zod.string()),
      images: zod.array(zod.string()),
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
      generateImageThumbnails: zod.boolean(),
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
      applyActorLabels: zod.array(ApplyActorLabelsEnum),
      applyStudioLabels: zod.array(ApplyStudioLabelsEnum),
      extractSceneActorsFromFilepath: zod.boolean(),
      extractSceneLabelsFromFilepath: zod.boolean(),
      extractSceneMoviesFromFilepath: zod.boolean(),
      extractSceneStudiosFromFilepath: zod.boolean(),
      matcher: zod.union([
        zod.object({
          type: zod.literal("legacy"),
          options: StringMatcherOptionsSchema,
        }),
        zod.object({
          type: zod.literal("word"),
          options: WordMatcherOptionsSchema,
        }),
      ]),
    }),
    plugins: zod.object({
      register: zod.record(pluginSchema),
      events: zod.record(zod.array(zod.string()) /* TODO: plugin call with arg */),

      allowSceneThumbnailOverwrite: zod.boolean(),
      allowActorThumbnailOverwrite: zod.boolean(),
      allowMovieThumbnailOverwrite: zod.boolean(),
      allowStudioThumbnailOverwrite: zod.boolean(),

      createMissingActors: zod.boolean(),
      createMissingStudios: zod.boolean(),
      createMissingLabels: zod.boolean(),
      createMissingMovies: zod.boolean(),
    }),
    log: zod.object({
      maxSize: zod.number().min(0),
    }),
  })
  .nonstrict();

export type IPlugin = zod.TypeOf<typeof pluginSchema>;
export type IConfig = zod.TypeOf<typeof configSchema>;

export function isValidConfig(val: unknown): true | Error {
  try {
    configSchema.parse(val);
    return true;
  } catch (error) {
    return error as Error;
  }
}
