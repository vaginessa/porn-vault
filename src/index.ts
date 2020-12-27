import { startup } from "./startup";
import { logger } from "./utils/logger";

(async (): Promise<void> => {
  try {
    await startup();
  } catch (error) {
    const _err = error as Error;
    logger.error(_err.message);
    logger.debug(_err.stack);
    process.exit(1);
  }
})();
