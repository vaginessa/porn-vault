import { startup } from "./startup";
import { logger } from "./utils/logger";

(async (): Promise<void> => {
  await startup();
})().catch((err: Error) => {
  logger.error(err.message);
  logger.debug(err.stack);
  process.exit(1);
});
