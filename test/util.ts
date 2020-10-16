import { existsSync } from "fs";
import { resolve } from "path";

// Assume these work perfectly
import { rimrafAsync, mkdirAsync } from "../src/utils/fs/async";

export const TEST_TEMP_DIR = resolve(process.cwd(), "temp");

export async function createTempTestingDir() {
  if (!existsSync(TEST_TEMP_DIR)) {
    await mkdirAsync(TEST_TEMP_DIR);
  }
}

export async function unlinkTempTestingDir() {
  if (existsSync(TEST_TEMP_DIR)) {
    await rimrafAsync(TEST_TEMP_DIR);
  }
}
