// typescript needs to be bundled with the executable
import "typescript";

import debug from "debug";
import { existsSync } from "fs";
import * as nodepath from "path";
import { register } from "ts-node";

import { IConfig } from "../config/schema";
import { getMatcher, getMatcherByType } from "../matching/matcher";
import { walk } from "../utils/fs/async";
import { createPluginLogger, formatMessage, handleError, logger } from "../utils/logger";
import { libraryPath } from "../utils/path";
import { Dictionary } from "../utils/types";
import VERSION from "../version";
import { modules } from "./context";

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
    handleError(`Error requiring ${modulePath}`, err);
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

    logger.info(`Running plugin ${pluginName}:`);
    try {
      const pluginResult = await runPlugin(config, pluginName, {
        data: <typeof result>JSON.parse(JSON.stringify(result)),
        event,
        ...inject,
        pluginArgs,
      });
      Object.assign(result, pluginResult);
    } catch (error) {
      handleError(`Plugin error`, error);
      numErrors++;
    }
  }
  logger.info(`Plugin run over...`);
  if (!numErrors) {
    logger.info(`Ran successfully ${config.plugins.events[event].length} plugins.`);
  } else {
    logger.error(`Ran ${config.plugins.events[event].length} plugins with ${numErrors} errors.`);
  }
  logger.verbose("Plugin series result");
  logger.verbose(result);
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

  if (!existsSync(path)) {
    throw new Error(`${pluginName}: definition not found (missing file).`);
  }

  const func = requireUncached(path);

  if (typeof func !== "function") {
    throw new Error(`${pluginName}: not a valid plugin.`);
  }

  logger.debug(plugin);

  const pluginLogger = createPluginLogger(pluginName, config.log.writeFile);

  const result = (await func({
    $walk: walk,
    $getMatcher: getMatcherByType,
    $matcher: getMatcher(),
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
    $log: (...msgs: unknown[]) => {
      logger.warn(`$log is deprecated, use $logger instead`);
      pluginLogger.info(msgs.map(formatMessage).join(" "));
    },
    $logger: pluginLogger,
    $throw: (str: string) => {
      debug(`vault:plugin:${pluginName}:error`)(str);
      throw new Error(str);
    },
    args: args || plugin.args || {},
    ...inject,
    ...modules,
  })) as unknown;

  if (typeof result !== "object") {
    throw new Error(`${pluginName}: malformed output.`);
  }

  logger.verbose("Plugin result:");
  logger.verbose(result);
  return result || {};
}
