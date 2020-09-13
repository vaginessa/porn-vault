import chokidar from "chokidar";
import { existsSync } from "fs";
import inquirer from "inquirer";
import path from "path";
import YAML from "yaml";

import { onConfigLoad } from "..";
import { readFileAsync, writeFileAsync } from "../fs/async";
import * as logger from "../logger";
import setupFunction from "../setup";
import { IConfig } from "./schema";

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
