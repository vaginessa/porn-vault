import { Router } from "express";
import { resolve } from "path";

import { getConfig, stopConfigFileWatcher, updateConfig, watchConfig } from "../config";
import { IConfig, isValidPluginsConfig } from "../config/schema";
import { PLUGIN_EXTENSIONS } from "../plugins";
import {
  initializePlugins,
  loadPlugin,
  registeredPlugins,
  validatePluginVersion,
} from "../plugins/register";
import { PluginArg } from "../plugins/types";
import { handleError, logger } from "../utils/logger";
import { getExtension } from "../utils/string";

const router = Router();

interface PluginDTO {
  id: string;
  path: string;
  args: object;
  version: string;
  requiredVersion: string;
  name: string;
  events: string[];
  authors: string[];
  description: string;
}

export type PluginCheck = Omit<PluginDTO, "id" | "args"> & {
  arguments: PluginArg[];
  hasValidArgs: boolean;
  hasValidVersion: boolean;
};

export interface PluginsConfig {
  global: Omit<IConfig["plugins"], "register" | "events">;
  register: Record<string, PluginDTO>;
  events: IConfig["plugins"]["events"];
}

function getPluginsConfig(): PluginsConfig {
  const config = getConfig();

  const { register: configRegister, events, ...global } = config.plugins;

  const register: Record<string, PluginDTO> = {};
  for (const [pluginId, pluginConfig] of Object.entries(configRegister)) {
    const resolvedPlugin = registeredPlugins[pluginId];
    register[pluginId] = {
      id: pluginId,
      path: pluginConfig.path,
      args: pluginConfig.args || {},
      requiredVersion: resolvedPlugin.requiredVersion || "",
      name: resolvedPlugin.info?.name || "",
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

router.post("/", async (req, res) => {
  const inputPluginsConfig = req.body as unknown;
  const validationRes = isValidPluginsConfig(req.body);
  if (validationRes !== true) {
    return res.status(400).send(validationRes.message);
  }

  const initialConfig = getConfig();

  const mergedConfig = JSON.parse(JSON.stringify(initialConfig)) as IConfig;
  Object.assign(mergedConfig.plugins, inputPluginsConfig);

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
    await watchConfig();
  } catch (err) {
    handleError("Could not save and load the new plugins config", err);
    res.status(500).send("Could not save config");
  }

  const pluginConfig = getPluginsConfig();
  res.json(pluginConfig);
});

router.post("/validate", (req, res) => {
  const { path, args } = (req.body || {}) as Partial<{ path: string; args: object }>;
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
      name: plugin.info?.name || "",
      path: resolvedPath,
      requiredVersion: plugin.requiredVersion || "",
      arguments: plugin.info?.arguments || [],
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
