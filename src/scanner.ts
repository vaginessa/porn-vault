import * as logger from "./logger";
import { checkImageFolders, checkVideoFolders } from "./queue/check";
import { tryStartProcessing } from "./queue/processing";

export let nextScanTimestamp = null as number | null;
let nextScanTimeout: NodeJS.Timeout | null = null;
export let isScanning = false;

/**
 * Triggers a scan (if none is currently running), then schedules the next one if
 * `nextScanMs` is given
 *
 * @param nextScanMs - after this scan *A*, in how long another scan *B* should be executed.
 * If a scan *C* was previously scheduled, will cancel it in favour of *B*.
 * If falsy, will leave *C* untouched and not schedule *B*
 */
export async function scanFolders(nextScanMs = 0): Promise<void> {
  if (isScanning) return;

  // If we will be scheduling another scan after this one, cancel
  // the existing scheduled one
  if (nextScanMs && nextScanTimeout) {
    clearTimeout(nextScanTimeout);
  }

  try {
    logger.message("Scanning folders...");
    isScanning = true;

    await checkVideoFolders().catch((err: Error) => {
      logger.error("Error while scanning video folders...");
      logger.error(err.message);
    });
    logger.success("Video scan done.");

    // Start processing as soon as video scan is done
    tryStartProcessing().catch((err: Error) => {
      logger.error("Couldn't start processing...");
      logger.error(err.message);
    });

    await checkImageFolders().catch((err: Error) => {
      logger.error("Error while scanning image folders...");
      logger.error(err.message);
    });
    isScanning = false;
  } catch (err) {
    logger.error("Scan failed " + (err as Error).message);
  }

  // Always try to schedule a scan after the current one ends
  scheduleNextScan(nextScanMs);
}

/**
 * Schedules a scan for later on. Passes the delay to `scanFolders`
 * so that the scan will trigger another one after itself.
 *
 * @param nextScanMs - in how long to schedule a scan starting from now,
 * and how long after each subsequent scan
 */
export function scheduleNextScan(nextScanMs: number): void {
  if (!nextScanMs) return;

  const nextScanDate = new Date(Date.now() + nextScanMs);
  nextScanTimestamp = nextScanDate.valueOf();
  logger.message(`Next scan at ${nextScanDate.toLocaleString()}`);

  nextScanTimeout = global.setTimeout(() => {
    scanFolders(nextScanMs).catch((err: Error) => {
      logger.error("Scan failed " + err.message);
    });
  }, nextScanMs);
}
