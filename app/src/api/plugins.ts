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

export async function getPluginsConfig(): Promise<AxiosResponse<PluginRes>> {
  return Axios.get<PluginRes>("/api/plugins", {
    params: { password: localStorage.getItem("password") },
  });
}

export async function checkPath(path: string, args?: object): Promise<AxiosResponse<ConfigPlugin>> {
  return await Axios.post<ConfigPlugin>(
    "/api/plugins/check",
    { path, args },
    { params: { password: localStorage.getItem("password") } }
  );
}
