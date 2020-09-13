import { existsSync } from "fs";

import { IConfig } from "../config/schema";
import { isDirectory } from "../fs/index";
import * as logger from "../logger";

export function checkUnusedPlugins(config: IConfig): void {
  for (const pluginName of Object.keys(config.plugins.register)) {
    let pluginUsed = false;
    for (const event of Object.values(config.plugins.events)) {
      if (event.some((name) => name === pluginName)) {
        pluginUsed = true;
      }
    }
    if (!pluginUsed) {
      logger.warn(`Unused plugin '${pluginName}'.`);
    }
  }
}

export function validatePlugins(config: IConfig): void {
  for (const name in config.plugins.register) {
    const plugin = config.plugins.register[name];
    const path = plugin.path;

    if (!path) {
      logger.error(`Missing plugin path for '${name}'.`);
      process.exit(1);
    }

    if (!existsSync(path) || isDirectory(path)) {
      logger.error(`Plugin definition for '${name}' not found (missing file).`);
      process.exit(1);
    }

    if (plugin.args) {
      if (plugin.args === null || typeof plugin.args !== "object") {
        logger.error(`Invalid arguments for ${name}.`);
        process.exit(1);
      }
    }
  }

  for (const eventName in config.plugins.events) {
    const event = config.plugins.events[eventName];
    for (const pluginItem of event) {
      if (typeof pluginItem === "string") {
        const pluginName = pluginItem;
        if (config.plugins.register[pluginName] === undefined) {
          logger.error(`Undefined plugin '${pluginName}' in use in event '${eventName}'.`);
          process.exit(1);
        }
      } /* else if (Array.isArray(pluginItem) && pluginItem.length === 2) {
        const pluginName = pluginItem[0];
        const pluginArgs = pluginItem[1];

        if (config.PLUGINS[pluginName] === undefined) {
          logger.error(`Undefined plugin '${pluginName}' in use in event '${eventName}'.`);
          process.exit(1);
        }

        if (!pluginArgs) {
          logger.error(`Invalid arguments for '${pluginName}'.`);
          process.exit(1);
        }

        if (typeof pluginArgs !== "object") {
          logger.error(`Invalid arguments for '${pluginName}'.`);
          process.exit(1);
        }
      } */ else {
        logger.error(`Invalid plugin use in event '${eventName}'`);
        process.exit(1);
      }
    }
  }
}
