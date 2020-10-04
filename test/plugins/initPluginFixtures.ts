import { assert } from "chai";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import path from "path";
import sinon from "sinon";

import { checkConfig, getConfig, resetLoadedConfig } from "../../src/config";
import mockConfig from "./fixtures/config.test.fixture.json";

const configJSONPath = path.resolve("config.test.json");
const configYAMLPath = path.resolve("config.test.yaml");

const mockConfigPath = path.resolve("./test/plugins/fixtures/config.test.fixture.json");

let exitStub = null as sinon.SinonStub | null;

/**
 * Removes existing test configs
 */
const cleanupFiles = async () => {
  // Cleanup for other test
  for (const configFilename of [configJSONPath, configYAMLPath]) {
    if (existsSync(configFilename)) {
      unlinkSync(configFilename);
    }
    assert.isFalse(existsSync(configFilename));
  }
};

/**
 * Copies the plugin test config to "config.test.json"
 */
const copyTestConfig = async () => {
  await cleanupFiles();

  copyFileSync(mockConfigPath, configJSONPath);
};

/**
 * Copies the plugin test config, stubs the process exit and loads the config.
 * To run before any test that requires the mock plugins to be in the loaded config
 */
export const initPluginsConfig = async () => {
  await copyTestConfig();

  // Stub the exit, just in case something fails.
  // This way, the tests will still proceed
  exitStub = sinon.stub(process, "exit");

  assert.isFalse(!!getConfig());

  await checkConfig();
  assert.isTrue(!!getConfig());
  assert.deepEqual(getConfig(), mockConfig);
};

/**
 * Cleans up test files, stubs, loaded config.
 * To run after any test that used the mock plugin config
 */
export const cleanupPluginsConfig = async () => {
  await cleanupFiles();

  resetLoadedConfig();

  if (exitStub) {
    if (exitStub.called) {
      throw new Error("Exit stub was called for plugin tests");
    }

    exitStub.restore();
    exitStub = null;
  }
};
