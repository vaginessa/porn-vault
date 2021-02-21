import * as nodepath from "path";

import { IConfig } from "../config/schema";
import { getMatcher, getMatcherByType } from "../matching/matcher";
import { walk } from "../utils/fs/async";
import { createPluginLogger, formatMessage, handleError, logger } from "../utils/logger";
import { libraryPath } from "../utils/path";
import { Dictionary } from "../utils/types";
import VERSION from "../version";
import { modules } from "./context";
import { getPlugin, requireUncached } from "./register";

export async function runPluginsSerial(
  config: IConfig,
  event: string,
  initialData: Dictionary<unknown>,
  inject?: Dictionary<unknown>
): Promise<Record<string, unknown>> {
  const result = initialData;
  if (!config.plugins.events[event]) {
    logger.warn(`No plugins defined for event ${event}.`);
    return result;
  }

  logger.info(`Running plugin event: ${event}`);

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
  const pluginDefinition = config.plugins.register[pluginName];

  if (!pluginDefinition) {
    throw new Error(`${pluginName}: plugin not found.`);
  }

  const func = getPlugin(pluginName);
  logger.debug(pluginDefinition);

  const pluginLogger = createPluginLogger(pluginName, config.log.writeFile);

  const result = (await func({
    $formatMessage: formatMessage,
    $walk: walk,
    $getMatcher: getMatcherByType,
    $matcher: getMatcher(),
    $version: VERSION,
    $config: JSON.parse(JSON.stringify(config)) as IConfig,
    $pluginName: pluginName,
    $pluginPath: nodepath.resolve(pluginDefinition.path),
    $cwd: process.cwd(),
    $library: libraryPath(""),
    $require: (partial: string) => {
      if (typeof partial !== "string") {
        throw new TypeError("$require: String required");
      }
      return requireUncached(nodepath.resolve(pluginDefinition.path, partial));
    },
    $logger: pluginLogger,
    $log: (...msgs: unknown[]) => {
      logger.warn(`$log is deprecated, use $logger instead`);
      pluginLogger.info(msgs.map(formatMessage).join(" "));
    },
    $throw: (...msgs: unknown[]) => {
      const msg = msgs.map(formatMessage).join(" ");
      pluginLogger.error(msg);
      throw new Error(msg);
    },
    args: args || pluginDefinition.args || {},
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
