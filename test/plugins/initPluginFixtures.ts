import { assert } from "chai";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import path from "path";
import sinon from "sinon";

import { checkConfig, getConfig, resetLoadedConfig } from "../../src/config";
import { IConfig } from "../../src/config/schema";
import { resetToTestConfig } from "../root.spec";

const configJSONPath = path.resolve("config.test.json");
const configYAMLPath = path.resolve("config.test.yaml");

export const CONFIG_FIXTURES: { name: string; path: string; config: IConfig }[] = [
  {
    name: "JS",
    path: path.resolve("./test/plugins/fixtures/config.test.fixture_js.json"),
  },
  {
    name: "TS",
    path: path.resolve("./test/plugins/fixtures/config.test.fixture_ts.json"),
  },
].map((fixture) => ({
  ...fixture,
  config: require(path.resolve(fixture.path)) as IConfig,
}));

let exitStub = null as sinon.SinonStub | null;

/**
 * Restores the exit stub, ensuring that it was not called.
 */
const restoreExitStub = () => {
  if (exitStub) {
    if (exitStub.called) {
      throw new Error(
        "Exit stub was called during plugin tests. A test may have failed somewhere, or the config may not have been loaded."
      );
    }

    exitStub.restore();
    exitStub = null;
  }
};

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
 * Copies the given plugin test config to "config.test.json"
 *
 * @param configPath - the path to the config to copy
 */
const copyTestConfig = async (configPath: string) => {
  copyFileSync(configPath, configJSONPath);
  assert.isTrue(existsSync(configJSONPath));
};

/**
 * Copies the plugin test config, stubs the process exit and loads the config.
 * To run before any test that requires the mock plugins to be in the loaded config
 *
 * @param configPath - path to the config to load
 * @param expectedConfig - the expected contents of the config
 */
export const initPluginsConfig = async (configPath: string, expectedConfig: IConfig) => {
  await cleanupFiles();
  await copyTestConfig(configPath);

  // Stub the exit, just in case something fails.
  // This way, the tests will still proceed
  exitStub = sinon.stub(process, "exit");

  resetLoadedConfig();
  assert.isFalse(!!getConfig());

  await checkConfig();
  assert.isTrue(!!getConfig());
  assert.deepEqual(getConfig(), expectedConfig);
  restoreExitStub();
};

/**
 * Cleans up test files, stubs, loaded config.
 * To run after any test that used the mock plugin config
 */
export const cleanupPluginsConfig = async () => {
  await cleanupFiles();

  resetLoadedConfig();

  restoreExitStub();

  // Reset to the testing config for other tests
  await resetToTestConfig();
};
