import debug from "debug";
import express from "express";
import winston from "winston";

import { getConfig } from "../config/index";
import { writeFileAsync } from "../utils/fs/async";

if (process.env.NODE_ENV === "development") {
  debug.enable("vault:*");
} else if (!process.env.DEBUG) {
  debug.enable("vault:success,vault:warn,vault:error,vault:message,vault:plugin");
}

export function formatMessage(message: unknown) {
  return typeof message === "string" ? message : JSON.stringify(message, null, 2);
}

export function createVaultLogger(level: string) {
  logger.silly("Creating logger");
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        const msg = formatMessage(message);
        return `${<string>timestamp} [vault] ${level}: ${msg}`;
      })
    ),
    level,
    transports: [new winston.transports.Console()],
  });
}

let logger = createVaultLogger(process.env.PV_LOG_LEVEL || "info");

export function setLogger(_logger: winston.Logger) {
  logger.debug("Refreshing logger");
  logger = _logger;
}

export { logger };

export function createPluginLogger(name: string) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        const msg = typeof message === "string" ? message : JSON.stringify(message, null, 2);
        return `${<string>timestamp} [vault:plugin:${name}] ${level}: ${msg}`;
      })
    ),
    level: "silly",
    transports: [new winston.transports.Console()],
  });
}

enum LogType {
  LOG = "log",
  WARN = "warn",
  ERROR = "error",
  SUCCESS = "success",
  HTTP = "http",
  MESSAGE = "message",
  IZZY = "izzy",
}

interface ILogData {
  type: LogType;
  text: string;
  date: number;
}

const logArray = [] as ILogData[];
export function getLog(): ILogData[] {
  return logArray;
}

function createItem(type: LogType, text: string) {
  return {
    type,
    text,
    date: +new Date(),
  } as ILogData;
}

function appendToLog(item: ILogData) {
  // For some reason, when directly testing config/index.ts (example: in config/index.spec.ts)
  // this file cannot resolve config/index.ts and the imported module will be undefined
  // causing undefined.getConfig() to throw an error
  if (process.env.NODE_ENV !== "test") {
    const config = getConfig();
    if (config && logArray.length === config.log.maxSize) logArray.shift();
  }
  logArray.push(item);
}

export async function logToFile(): Promise<void> {
  return writeFileAsync(`log-${new Date().toISOString()}`, JSON.stringify(logArray), "utf-8");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function merge(...args: any[]) {
  return args
    .map((a) => {
      // We don't want to stringify strings, otherwise newlines will be escaped
      const str = typeof a === "string" ? a : JSON.stringify(a, null, 2);
      if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
      return str;
    })
    .join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...args: any): void => {
  const text = merge(...args);
  debug("vault:log")(text);
  appendToLog(createItem(LogType.LOG, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const success = (...args: any): void => {
  const text = merge(...args);
  debug("vault:success")(text);
  appendToLog(createItem(LogType.SUCCESS, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const http = (...args: any): void => {
  const text = merge(...args);
  debug("vault:http")(text);
  appendToLog(createItem(LogType.HTTP, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const warn = (...args: any): void => {
  const text = merge(...args);
  debug("vault:warn")(text);
  appendToLog(createItem(LogType.WARN, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const error = (...args: any): void => {
  const text = merge(...args);
  debug("vault:error")(text);
  appendToLog(createItem(LogType.ERROR, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const message = (...args: any): void => {
  const text = merge(...args);
  debug("vault:message")(text);
  appendToLog(createItem(LogType.MESSAGE, text));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const izzy = (...args: any): void => {
  const text = merge(...args);
  debug("vault:izzy")(text);
  appendToLog(createItem(LogType.IZZY, text));
};

export const httpLog = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  // http(`${req.method} ${req.path}: ${new Date().toLocaleString()}`);
  logger.http(`${req.method} ${req.path}: ${new Date().toLocaleString()}`);
  next();
};
