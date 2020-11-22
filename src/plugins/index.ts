// typescript needs to be bundled with the executable
import "typescript";

import axios from "axios";
import boxen from "boxen";
import cheerio from "cheerio";
import debug from "debug";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import { existsSync } from "fs";
import inquirer from "inquirer";
import jimp from "jimp";
import moment from "moment";
import ora from "ora";
import * as os from "os";
import * as nodepath from "path";
import readline from "readline";
import semver from "semver";
import { register } from "ts-node";
import YAML from "yaml";
import zod from "zod";

import { IConfig } from "../config/schema";
import { getMatcher } from "../matching/matcher";
import { walk } from "../utils/fs/async";
import * as logger from "../utils/logger";
import { libraryPath } from "../utils/path";
import { Dictionary } from "../utils/types";
import VERSION from "../version";

let didRegisterTsNode = false;

function requireUncached(modulePath: string): unknown {
  if (!didRegisterTsNode && modulePath.endsWith(".ts")) {
    register({
      emit: false,
      skipProject: true, // Do not use this projects tsconfig.json
      transpileOnly: true, // Disable type checking
      compilerHost: true,
      compilerOptions: {
        allowJs: true,
        target: "es6",
        module: "commonjs",
        lib: ["es6", "dom", "es2016", "es2018"],
        sourceMap: true,
        removeComments: false,
        esModuleInterop: true,
        checkJs: false,
        isolatedModules: false,
      },
    });
    didRegisterTsNode = true;
  }

  try {
    delete require.cache[require.resolve(modulePath)];
    return <unknown>require(modulePath);
  } catch (err) {
    const _err = err as Error;
    logger.error(`Error requiring ${modulePath}:`);
    logger.error(_err);
    logger.error(_err.message);

    throw err;
  }
}

export async function runPluginsSerial(
  config: IConfig,
  event: string,
  inject?: Dictionary<unknown>
): Promise<Record<string, unknown>> {
  const result = {} as Dictionary<unknown>;
  if (!config.plugins.events[event]) {
    logger.warn(`No plugins defined for event ${event}.`);
    return result;
  }

  let numErrors = 0;

  for (const pluginItem of config.plugins.events[event]) {
    const pluginName: string = pluginItem;
    let pluginArgs: Record<string, unknown> | undefined;

    /*  if (typeof pluginItem === "string") pluginName = pluginItem;
    else {
      pluginName = pluginItem[0];
      pluginArgs = pluginItem[1];
    } */

    logger.message(`Running plugin ${pluginName}:`);
    try {
      const pluginResult = await runPlugin(config, pluginName, {
        data: <typeof result>JSON.parse(JSON.stringify(result)),
        event,
        ...inject,
        pluginArgs,
      });
      Object.assign(result, pluginResult);
    } catch (error) {
      const _err = <Error>error;
      logger.log(_err);
      logger.error(_err.message);
      numErrors++;
    }
  }
  logger.log(`Plugin run over...`);
  if (!numErrors) {
    logger.success(`Ran successfully ${config.plugins.events[event].length} plugins.`);
  } else {
    logger.warn(`Ran ${config.plugins.events[event].length} plugins with ${numErrors} errors.`);
  }
  return result;
}

export async function runPlugin(
  config: IConfig,
  pluginName: string,
  inject?: Dictionary<unknown>,
  args?: Dictionary<unknown>
): Promise<unknown> {
  const plugin = config.plugins.register[pluginName];

  if (!plugin) {
    throw new Error(`${pluginName}: plugin not found.`);
  }

  const path = nodepath.resolve(plugin.path);

  if (path) {
    if (!existsSync(path)) {
      throw new Error(`${pluginName}: definition not found (missing file).`);
    }

    const func = requireUncached(path);

    if (typeof func !== "function") {
      throw new Error(`${pluginName}: not a valid plugin.`);
    }

    logger.log(plugin);

    try {
      const result = (await func({
        $walk: walk,
        $matcher: getMatcher(),
        $zod: zod,
        $version: VERSION,
        $config: JSON.parse(JSON.stringify(config)) as IConfig,
        $pluginName: pluginName,
        $pluginPath: path,
        $cwd: process.cwd(),
        $library: libraryPath(""),
        $require: (partial: string) => {
          if (typeof partial !== "string") {
            throw new TypeError("$require: String required");
          }

          return requireUncached(nodepath.resolve(path, partial));
        },
        /* $modules: {
          ...
          fs: fs,
          path: nodepath,
          axios: axios,
          cheerio: cheerio,
          moment: moment
        }, */
        // TODO: deprecate at some point, replace with ^
        $semver: semver,
        $os: os,
        $readline: readline,
        $inquirer: inquirer,
        $yaml: YAML,
        $jimp: jimp,
        $ffmpeg: ffmpeg,
        $fs: fs,
        $path: nodepath,
        $axios: axios,
        $cheerio: cheerio,
        $moment: moment,
        $log: debug("vault:plugin"),
        $loader: ora,
        $boxen: boxen,
        $throw: (str: string) => {
          throw new Error(str);
        },
        args: args || plugin.args || {},
        ...inject,
      })) as unknown;

      if (typeof result !== "object") {
        throw new Error(`${pluginName}: malformed output.`);
      }

      return result || {};
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error(`${pluginName}: path not defined.`);
  }
}
