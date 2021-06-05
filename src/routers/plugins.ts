import { Router } from "express";

import { getConfig } from "../config";
import { registeredPlugins } from "../plugins/register";

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

export default router;
