import Axios, { AxiosResponse } from "axios";

export interface ConfigPlugin {
  name: string;
  path: string;
  args: object;
  version: string;
  requiredVersion: string;
  events: string[];
  authors: string[];
  description: string;
  hasValidArgs: boolean;
  hasValidVersion: boolean;
}

export type GlobalConfigValue = boolean | string | number | string[];

export interface PluginRes {
  register: Record<string, ConfigPlugin>;
  events: Record<string, string[]>;
  global: Record<string, GlobalConfigValue>;
}

interface EditPluginsConfig {
  [x: string]: unknown;
  register: Record<string, { path: string; args: Record<string, unknown> }>;
  events: Record<string, string[]>;
}

export async function getPluginsConfig(): Promise<AxiosResponse<PluginRes>> {
  return Axios.get<PluginRes>("/api/plugins", {
    params: { password: localStorage.getItem("password") },
  });
}

export async function savePluginsConfig(
  config: EditPluginsConfig
): Promise<AxiosResponse<PluginRes>> {
  return Axios.patch<PluginRes>("/api/plugins", config, {
    params: { password: localStorage.getItem("password") },
  });
}

export async function validatePlugin(
  path: string,
  args?: object
): Promise<AxiosResponse<ConfigPlugin>> {
  return await Axios.post<ConfigPlugin>(
    "/api/plugins/validate",
    { path, args },
    { params: { password: localStorage.getItem("password") } }
  );
}
