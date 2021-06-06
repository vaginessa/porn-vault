import { Router } from "express";
import { resolve } from "path";

import { getConfig } from "../config";
import { PLUGIN_EXTENSIONS } from "../plugins";
import { loadPlugin, registeredPlugins, validatePluginVersion } from "../plugins/register";
import { handleError } from "../utils/logger";
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

router.get("/", (req, res) => {
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

  const pluginConfig = {
    global,
    register,
    events,
  };

  res.json(pluginConfig);
});

router.post("/check", (req, res) => {
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
