// typescript needs to be bundled with the executable
import "typescript";

import chokidar, { FSWatcher } from "chokidar";
import { resolve } from "path";
import semver from "semver";
import { register } from "ts-node";

import { IConfig } from "../config/schema";
import { handleError, logger } from "../utils/logger";
import version from "../version";

let didRegisterTsNode = false;

export function requireUncached(modulePath: string): unknown {
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

  const fullPath = resolve(modulePath);
  try {
    delete require.cache[require.resolve(fullPath)];
    return <unknown>require(fullPath);
  } catch (err) {
    handleError(`Error requiring "${fullPath}"`, err);
    throw err;
  }
}

// Imported from plugin dev context
interface IPluginMetadata {
  // Used to validate usage
  minVersion: string;
  validateArguments: (args: unknown) => boolean;

  // Taken from plugin's info.json
  events: string[];
  arguments: unknown;
  version: string;
  authors: string[];
  name: string;
  description: string;
};
type PluginFunction<Input, Output> = (ctx: Input) => Promise<Output>;
type Plugin<Input, Output> = PluginFunction<Input, Output> & Partial<IPluginMetadata>;

type UnknownPlugin = Plugin<unknown, unknown>

export let registeredPlugins: Record<string, UnknownPlugin> = {};
let pluginWatchers: FSWatcher[] = [];

export function getPlugin(name: string): UnknownPlugin {
  logger.debug(`Getting plugin "${name}" from plugin cache`);
  return registeredPlugins[name];
}

export function clearPluginWatchers(): void {
  logger.debug(`Clearing ${pluginWatchers.length} plugin watchers`);
  for (const watcher of pluginWatchers) {
    watcher.close().catch((err) => {
      handleError("Error while closing file watcher", err);
    });
  }
  pluginWatchers = [];
}

// Throws error if argument validation fails
function validatePluginArguments(name: string, plugin: UnknownPlugin, args: unknown): true {
  if (!plugin.validateArguments) {
    return true;
  }

  if (!plugin.validateArguments(args)) {
    throw new Error(`Argument validation for "${name}" failed: ${JSON.stringify(args, null, 2)}`)
  }
}

export function cachePlugin(name: string, path: string): void {
  logger.debug(`Loading plugin "${name}" from "${path}"`);
  const required = requireUncached(path);
  if (typeof required !== "function") {
    throw new Error(`Invalid plugin format for plugin "${name}": ${typeof required}`);
  }

  const pluginFunction = <UnknownPlugin>required;

  if (pluginFunction.minVersion) {
    const min = pluginFunction.minVersion
    if (semver.lt(version, min)) {
      throw new Error(`Plugin "${name}" requires PV version ${min} or above`)
    }
  }

  registeredPlugins[name] = pluginFunction;
}

export function initializePlugins(config: IConfig) {
  logger.verbose("Loading plugins");
  clearPluginWatchers();
  registeredPlugins = {};
  for (const pluginName in config.plugins.register) {
    const { path } = config.plugins.register[pluginName];
    cachePlugin(pluginName, path);
  }
  watchPlugins(config);
}

export function watchPlugins(config: IConfig) {
  logger.verbose("Watching plugins for change");
  for (const pluginName in config.plugins.register) {
    const { path } = config.plugins.register[pluginName];
    logger.debug(`Watching plugin source "${pluginName}" @ "${path}"`);

    const watcher = chokidar
      .watch(path, {
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      })
      .on("change", () => {
        logger.verbose(`Plugin "${pluginName}" changed, reloading...`);
        cachePlugin(pluginName, path);
      })
      .on("unlink", () => {
        logger.verbose(`Plugin "${pluginName}" deleted, reinitializing plugins`);
        initializePlugins(config);
      });
    pluginWatchers.push(watcher);
  }
}
