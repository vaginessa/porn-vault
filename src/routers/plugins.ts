import { Router } from "express";
import { resolve } from "path";

import { getConfig, stopConfigFileWatcher, updateConfig } from "../config";
import { IConfig } from "../config/schema";
import { PLUGIN_EXTENSIONS } from "../plugins";
import {
  initializePlugins,
  loadPlugin,
  registeredPlugins,
  validatePluginVersion,
} from "../plugins/register";
import { handleError, logger } from "../utils/logger";
import { getExtension } from "../utils/string";

const router = Router();

interface PluginDTO {
  name: string;
  path: string;
  args: object;
  version: string;
  requiredVersion: string;
  events: string[];
  authors: string[];
  description: string;
}

interface PluginCheck extends PluginDTO {
  hasValidArgs: boolean;
  hasValidVersion: boolean;
}

interface PluginsConfig {
  global: Omit<IConfig["plugins"], "register" | "events">;
  register: Record<string, PluginDTO>;
  events: IConfig["plugins"]["events"];
}

type EditPluginsConfig = IConfig["plugins"];

function getPluginsConfig(): PluginsConfig {
  const config = getConfig();

  const { register: configRegister, events, ...global } = config.plugins;

  const register: Record<string, PluginDTO> = {};
  for (const [pluginName, pluginConfig] of Object.entries(configRegister)) {
    const resolvedPlugin = registeredPlugins[pluginName];
    register[pluginName] = {
      name: pluginName,
      path: pluginConfig.path,
      args: pluginConfig.args || {},
      requiredVersion: resolvedPlugin.requiredVersion || "",
      version: resolvedPlugin.info?.version ?? "",
      events: resolvedPlugin.info?.events ?? [],
      authors: resolvedPlugin.info?.authors ?? [],
      description: resolvedPlugin.info?.description ?? "",
    };
  }

  const pluginConfig: PluginsConfig = {
    global,
    register,
    events,
  };

  return pluginConfig;
}

router.get("/", (req, res) => {
  const pluginConfig = getPluginsConfig();

  res.json(pluginConfig);
});

router.patch("/", async (req, res) => {
  const { register, events, ...globalConfig } = (req.body || {}) as Partial<EditPluginsConfig>;
  const initialConfig = getConfig();

  const mergedConfig = JSON.parse(JSON.stringify(initialConfig)) as IConfig;
  if (globalConfig) {
    Object.assign(mergedConfig.plugins, globalConfig);
  }
  if (register) {
    const newRegister: IConfig["plugins"]["register"] = {};
    Object.entries(register).forEach(([name, { path, args }]) => {
      newRegister[name] = { path, args };
    });
    mergedConfig.plugins.register = newRegister;
  }
  if (events) {
    mergedConfig.plugins.events = events;
  }

  try {
    initializePlugins(mergedConfig);
    logger.verbose("Successfully initialized new plugins, will save the config");
  } catch (err) {
    handleError("Could not initialize new plugins. Will reload the original plugins", err);
    // Reinitilize plugins with the unmodified config
    initializePlugins(initialConfig);
    return res.status(400).send("Could not initialize plugins with this config");
  }

  try {
    stopConfigFileWatcher?.(); // Stop watching to prevent useless reload
    await updateConfig(mergedConfig);
    logger.info("Successfully validated new plugins config and saved new config file");
  } catch (err) {
    handleError("Could not save and load the new plugins config", err);
    res.status(500).send("Could not save config");
  }

  const pluginConfig = getPluginsConfig();
  res.json(pluginConfig);
});

router.post("/validate", (req, res) => {
  const { path, args } = req.body as { path?: string; args?: object };
  if (!path) {
    return res.status(400).send("Invalid path");
  }

  const resolvedPath = resolve(path);
  const ext = getExtension(resolvedPath);
  if (!PLUGIN_EXTENSIONS.includes(ext)) {
    return res
      .status(400)
      .send(
        `Invalid file extension for plugin. Allowed extensions: ${PLUGIN_EXTENSIONS.join(", ")}`
      );
  }

  try {
    const plugin = loadPlugin("<user plugin>", resolvedPath);
    let hasValidArgs = true;
    if (args && !!plugin.validateArguments) {
      hasValidArgs = plugin.validateArguments(args);
    }

    const hasValidVersion = validatePluginVersion("<user plugin>", plugin);

    const ret: PluginCheck = {
      name: plugin.name,
      path: resolvedPath,
      args: {},
      requiredVersion: plugin.requiredVersion || "",
      version: plugin.info?.version ?? "",
      events: plugin.info?.events ?? [],
      authors: plugin.info?.authors ?? [],
      description: plugin.info?.description ?? "",
      hasValidArgs,
      hasValidVersion,
    };
    return res.json(ret);
  } catch (err) {
    handleError(`Error checking user plugin ${resolvedPath}`, err);
    return res.status(400).send();
  }
});

export default router;
