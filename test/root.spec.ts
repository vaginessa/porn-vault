import boxen from "boxen";
import { expect } from "chai";

import { createVault } from "../src/app";
import { giannaProcess, giannaVersion, resetGianna, spawnGianna } from "../src/binaries/gianna";
import { izzyProcess, izzyVersion, resetIzzy, spawnIzzy } from "../src/binaries/izzy";
import { getConfig, loadTestConfig, resetLoadedConfig } from "../src/config";
import { loadStores } from "../src/database";
import { buildIndices } from "../src/search";
import VERSION from "../src/version";
import { Vault } from "./../src/app";

const port = 5000;
let teardown: () => void;

let vault: Vault;

export async function resetToTestConfig() {
  resetLoadedConfig();
  await loadTestConfig();
  expect(!!getConfig()).to.be.true;
}

before(async () => {
  process.env.DEBUG = "vault:*";

  console.log(`Starting test server on port ${port}`);

  await resetToTestConfig();
  const config = getConfig();
  console.log(`Env: ${process.env.NODE_ENV}`);
  console.log(config);
  vault = createVault();

  await vault.startServer(port);

  console.log(`Server running on port ${port}`);

  vault.setupMessage = "Loading database...";
  if (await izzyVersion()) {
    console.log("Izzy already running, clearing...");
    await resetIzzy();
  } else {
    await spawnIzzy();
  }

  try {
    await loadStores();
  } catch (error) {
    const _err = <Error>error;
    console.error(_err);
    console.error(`Error while loading database: ${_err.message}`);
    console.warn("Try restarting, if the error persists, your database may be corrupted");
    process.exit(1);
  }

  vault.setupMessage = "Loading search engine...";
  if (await giannaVersion()) {
    console.log("Gianna already running, clearing...");
    await resetGianna();
  } else {
    await spawnGianna();
  }

  try {
    vault.setupMessage = "Building search indices...";
    await buildIndices();
  } catch (error) {
    const _err = <Error>error;
    console.error(_err);
    console.error(`Error while indexing items: ${_err.message}`);
    console.warn("Try restarting, if the error persists, your database may be corrupted");
    process.exit(1);
  }

  vault.serverReady = true;
  const protocol = config.server.https.enable ? "https" : "http";

  console.log(
    boxen(`TEST PORN VAULT ${VERSION} READY\nOpen ${protocol}://localhost:${port}/`, {
      padding: 1,
      margin: 1,
    })
  );

  teardown = () => {
    console.log("Closing test server");
    vault.close();
  };
});

after(() => {
  console.log("Killing izzy...");
  izzyProcess.kill();
  console.log("Killing gianna...");
  giannaProcess.kill();
  teardown();
});
