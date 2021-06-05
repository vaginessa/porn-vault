import { Router } from "express";
import { resolve } from "path";

import { getConfig } from "../config";
import { loadPlugin, registeredPlugins } from "../plugins/register";
import { handleError } from "../utils/logger";

const router = Router();

interface PluginDTO {
  name: string;
  path: string;
  args: object;
  version: string;
  events: string[];
  authors: string[];
  description: string;
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
  const { path } = req.body as { path?: string };
  if (!path) {
    return res.status(400).send("Invalid path");
  }

  const resolvedPath = resolve(path);
  try {
    const plugin = loadPlugin("<user plugin>", resolvedPath);
    const ret: PluginDTO = {
      name: plugin.name,
      path: resolvedPath,
      args: {},
      version: plugin.info?.version ?? "",
      events: plugin.info?.events ?? [],
      authors: plugin.info?.authors ?? [],
      description: plugin.info?.description ?? "",
    };
    return res.json(ret);
  } catch (err) {
    handleError(`Error checking user plugin ${resolvedPath}`, err);
    return res.status(400).send();
  }
});

export default router;
