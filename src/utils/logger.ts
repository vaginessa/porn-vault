import "winston-daily-rotate-file";

import express from "express";
import winston from "winston";

import { getConfig } from "../config/index";

export function formatMessage(message: unknown) {
  return typeof message === "string" ? message : JSON.stringify(message, null, 2);
}

let logger = createVaultLogger(process.env.PV_LOG_LEVEL || "info", []);

export function handleError(message: string, error: unknown, bail = false) {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
    logger.debug(error.stack);
  } else {
    logger.error(`${message}: ${formatMessage(message)}`);
  }
  if (bail) {
    process.exit(1);
  }
}

function fileTransports(items: { level: string; prefix: string }[]) {
  return items.map(({ level, prefix }) => createFileTransport(level, prefix));
}

function createFileTransport(level: string, prefix = "") {
  return new winston.transports.DailyRotateFile({
    filename: `${prefix}pv-%DATE%.log`,
    datePattern: "YYYY-MM-DD-HH",
    maxSize: "20m",
    maxFiles: "14d",
    level,
    dirname: process.env.PV_LOG_FOLDER || "logs",
  });
}

export function createVaultLogger(
  consoleLevel: string,
  files: { level: string; prefix: string }[]
) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        const msg = formatMessage(message);
        return `${<string>timestamp} [vault] ${level}: ${msg}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        level: consoleLevel,
      }),
      ...fileTransports(files),
    ],
  });
}

export function setLogger(_logger: winston.Logger) {
  logger.debug("Setting logger");
  logger = _logger;
}

export { logger };

export function createPluginLogger(name: string, files: { level: string; prefix: string }[]) {
  const config = getConfig();
  const { level } = config.log;

  logger.debug(`Creating plugin logger: ${name}`);

  return winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        const msg = typeof message === "string" ? message : JSON.stringify(message, null, 2);
        return `${<string>timestamp} [vault:plugin:${name}] ${level}: ${msg}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        level,
      }),
      ...fileTransports(files),
    ],
  });
}

export const httpLog = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  // http(`${req.method} ${req.path}: ${new Date().toLocaleString()}`);
  logger.http(`${req.method} ${req.path}: ${new Date().toLocaleString()}`);
  next();
};
