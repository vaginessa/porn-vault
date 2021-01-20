import express from "express";
import { sha512 } from "js-sha512";
import path from "path";

import { getConfig } from "../config";
import { handleError, logger } from "../utils/logger";

function validatePassword(input: string | undefined, real: string | null): boolean {
  if (!real) {
    return true;
  }
  if (!input) {
    return false;
  }
  if (sha512(input) === real) {
    return true;
  }
  return real === input;
}

export function checkPassword(req: express.Request, res: express.Response): unknown {
  const password = (<Record<string, unknown>>req.query).password as string | undefined;

  if (!password) {
    return res.sendStatus(400);
  }

  const config = getConfig();

  if (validatePassword(password, config.auth.password)) {
    return res.json(config.auth.password);
  }

  res.sendStatus(401);
}

export function passwordHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): unknown {
  const config = getConfig();
  if (!config.auth.password) {
    return next();
  }

  if (validatePassword(<string>req.headers["x-pass"], config.auth.password)) {
    logger.debug("Auth OK");
    return next();
  }

  const password = (<Record<string, unknown>>req.query).password as string | undefined;

  if (validatePassword(password, config.auth.password)) {
    logger.debug("Auth OK");
    return next();
  }

  try {
    return res.status(401).sendFile(path.resolve("./views/signin.html"));
  } catch (err) {
    handleError("Could not send sign-in page", err);
  }
}
