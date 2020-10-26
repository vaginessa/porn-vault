import chokidar from "chokidar";
import { existsSync } from "fs";
import inquirer from "inquirer";
import path from "path";
import YAML from "yaml";

import setupFunction from "../setup";
import { readFileAsync, writeFileAsync } from "../utils/fs/async";
import * as logger from "../utils/logger";
import { IConfig, isValidConfig } from "./schema";
import { validateConfigExtra } from "./validate";

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

let loadedConfig: IConfig | null;
export let configFile: string;

const configFilename = process.env.NODE_ENV === "test" ? "config.test" : "config";

const configJSONFilename = path.resolve(process.cwd(), `${configFilename}.json`);
const configYAMLFilename = path.resolve(process.cwd(), `${configFilename}.yaml`);

async function setupNewConfig(): Promise<void> {
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

  process.exit(0);
}
export async function findAndLoadConfig(): Promise<boolean> {
  try {
    if (existsSync(configJSONFilename)) {
      logger.message(`Loading ${configJSONFilename}...`);
      loadedConfig = JSON.parse(await readFileAsync(configJSONFilename, "utf-8")) as IConfig;
      configFile = configJSONFilename;
      // loadedConfigFormat = ConfigFileFormat.JSON;
      return true;
    } else if (existsSync(configYAMLFilename)) {
      logger.message(`Loading ${configYAMLFilename}...`);
      loadedConfig = YAML.parse(await readFileAsync(configYAMLFilename, "utf-8")) as IConfig;
      configFile = configYAMLFilename;
      // loadedConfigFormat = ConfigFileFormat.YAML;
      return true;
    } else {
      await setupNewConfig();
      return true;
    }
  } catch (error) {
    logger.error(
      "ERROR when loading config, please fix it. Run your file through a linter before trying again (search for 'JSON/YAML linter' online)."
    );
    logger.error(error);
    process.exit(1);
  }
}

export function getConfig(): IConfig {
  return loadedConfig as IConfig;
}

/**
 * @param config - the config to test
 * @param exitIfInvalid - if should exit as soon as the config does not
 * fit the schema, or throw
 */
export function checkConfig(config: IConfig, exitIfInvalid = true): void {
  const validationError = isValidConfig(config);
  if (validationError !== true) {
    logger.warn(
      "Invalid config. Please run your file through a linter before trying again (search for 'JSON/YAML linter' online)."
    );
    logger.error(validationError.message);
    if (exitIfInvalid) {
      process.exit(1);
    } else {
      throw validationError;
    }
  }

  validateConfigExtra(config);
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
      } else if (configFile.endsWith(".yaml")) {
        newConfig = YAML.parse(await readFileAsync(configYAMLFilename, "utf-8")) as IConfig;
      }
    } catch (error) {
      logger.error(
        "ERROR when loading new config, please fix it. Run your file through a linter before trying again (search for 'JSON/YAML linter' online)."
      );
      logger.error(error);
    }

    if (!newConfig) {
      logger.warn("Couldn't load config, try again");
      return;
    }

    try {
      // Do not exit if schema invalid
      checkConfig(newConfig, false);
      // Only use the new config once it has been validated
      loadedConfig = newConfig;
    } catch (err) {
      logger.warn("Couldn't load config, try again");
    }
  });

  return async (): Promise<void> => watcher.close();
}

export function resetLoadedConfig(): void {
  loadedConfig = null;
}
