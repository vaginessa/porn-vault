import { existsSync } from "fs";

import { IConfig } from "../config/schema";
import { isDirectory } from "../utils/fs/index";
import * as logger from "../utils/logger";

export function checkUnusedPlugins(config: IConfig): void {
  for (const pluginName of Object.keys(config.plugins.register)) {
    let pluginUsed = false;
    for (const event of Object.values(config.plugins.events)) {
      if (event.some((name) => name === pluginName)) {
        pluginUsed = true;
      }
    }
    if (!pluginUsed) {
      logger.warn(`Unused plugin "${pluginName}".`);
    }
  }
}

/**
 * @param config - the config whose plugins to validate
 * @throw
 */
export function validatePlugins(config: IConfig): void {
  for (const name in config.plugins.register) {
    const plugin = config.plugins.register[name];
    const path = plugin.path;

    if (!path) {
      throw new Error(`Missing plugin path for "${name}".`);
    }

    if (!existsSync(path) || isDirectory(path)) {
      throw new Error(`Plugin definition for "${name}" not found (missing file).`);
    }

    if (plugin.args) {
      if (plugin.args === null || typeof plugin.args !== "object") {
        throw new Error(`Invalid arguments for plugin "${name}".`);
      }
    }
  }

  for (const eventName in config.plugins.events) {
    const event = config.plugins.events[eventName];
    for (const pluginItem of event) {
      if (typeof pluginItem === "string") {
        const pluginName = pluginItem;
        if (!config.plugins.register[pluginName]) {
          throw new Error(`Undefined plugin "${pluginName}" in use in event "${eventName}".`);
        }
      } else {
        throw new Error(`Invalid plugin use in event "${eventName}"`);
      }
    }
  }
}
