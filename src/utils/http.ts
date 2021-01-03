import { IConfig } from "../config/schema";

export function protocol(config: IConfig) {
  return config.server.https.enable ? "https" : "http";
}
