import express from "express";
import { getConfig } from "./config";
const sha = require("js-sha512").sha512;

const COOKIE = "90325iaow3j5oiwj5awebasebasebeawqebaqwebqwe";

export function checkPassword(req: express.Request, res: express.Response) {
  if (!getConfig().PASSWORD || sha(req.query.pass) == getConfig().PASSWORD) {
    res.json(COOKIE);
  } else res.sendStatus(401);
}

export function passwordHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (
    !getConfig().PASSWORD ||
    req.headers["x-pass"] == COOKIE ||
    sha(req.query.pass) == getConfig().PASSWORD
  )
    next();
  else {
    res.sendStatus(401);
  }
}
