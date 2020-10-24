import boxen from "boxen";
import { expect } from "chai";
import { existsSync } from "fs";
import { Context } from "mocha";
import path from "path";
import sinon from "sinon";

import { createVault } from "../src/app";
import { getFFMpegURL, getFFProbeURL } from "../src/binaries/ffmpeg-download";
import {
  ensureGiannaExists,
  giannaPath,
  giannaProcess,
  giannaVersion,
  resetGianna,
  spawnGianna,
} from "../src/binaries/gianna";
import {
  ensureIzzyExists,
  izzyPath,
  izzyProcess,
  izzyVersion,
  resetIzzy,
  spawnIzzy,
} from "../src/binaries/izzy";
import { getConfig, loadTestConfig, resetLoadedConfig } from "../src/config";
import { loadStores } from "../src/database";
import { buildIndices } from "../src/search";
import { downloadFFLibs } from "../src/setup";
import VERSION from "../src/version";
import { Vault } from "./../src/app";

const port = 5000;
let teardown: () => void;

let vault: Vault;

let exitStub: sinon.SinonStub = sinon.stub(process, "exit");

export async function resetToTestConfig() {
  resetLoadedConfig();
  await loadTestConfig();
  expect(!!getConfig()).to.be.true;
}

before(async function () {
  (this as Context).timeout(60 * 1000); // time to download binaries

  try {
    process.env.DEBUG = "vault:*";

    console.log(`Starting test server on port ${port}`);

    await resetToTestConfig();
    const config = getConfig();
    console.log(`Env: ${process.env.NODE_ENV}`);
    console.log(config);

    if (!existsSync(path.basename(getFFMpegURL())) || !path.basename(getFFProbeURL())) {
      await downloadFFLibs(config);
    }
    await ensureIzzyExists();
    await ensureGiannaExists();
    console.log("Downloaded binaries");

    vault = createVault();

    await vault.startServer(port);

    console.log(`Server running on port ${port}`);

    vault.setupMessage = "Loading database...";
    if (await izzyVersion()) {
      console.log("Izzy already running, clearing...");
      await resetIzzy();
    } else {
      console.log("Spawning Izzy");
      await spawnIzzy();
    }

    try {
      await loadStores();
    } catch (error) {
      const _err = <Error>error;
      console.error(_err);
      console.error(`Error while loading database: ${_err.message}`);
      console.warn("Try restarting, if the error persists, your database may be corrupted");
      throw error;
    }

    vault.setupMessage = "Loading search engine...";
    if (await giannaVersion()) {
      console.log("Gianna already running, clearing...");
      await resetGianna();
    } else {
      console.log("Spawning Gianna");
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
      throw error;
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

    if (exitStub.called) {
      throw new Error("Exit stub was called while setting up test environment");
    }

    exitStub.restore();
  } catch (error) {
    console.error("Error setting up test environment");
    console.error(error);
    process.exit(1);
  }
});

describe("root", () => {
  it("binaries were downloaded/already exist", () => {
    expect(existsSync(path.basename(getFFMpegURL()))).to.be.true;
    expect(existsSync(path.basename(getFFProbeURL()))).to.be.true;
    expect(existsSync(izzyPath)).to.be.true;
    expect(existsSync(giannaPath)).to.be.true;
  });
});

after(() => {
  console.log("Killing izzy...");
  izzyProcess.kill();
  console.log("Killing gianna...");
  giannaProcess.kill();
  teardown();
});
