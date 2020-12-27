import dotenv from "dotenv";
import { existsSync } from "fs";

import { logger } from "./utils/logger";

export function loadEnv(file = ".env") {
  if (existsSync(file)) {
    logger.debug(`Loading ${file}`);
    dotenv.config({
      path: file,
    });
  }
}
