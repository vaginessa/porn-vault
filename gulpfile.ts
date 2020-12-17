import { exec, ExecOptions } from "child_process";
import { mkdirSync } from "fs";
import { dest, src } from "gulp";
import zip from "gulp-zip";
import yargs from "yargs";

import { version as packageVersion } from "./package.json";
import { version as assetsVersion } from "./assets/version.json";

const gulpArgs = yargs.string("build-version").argv;

/**
 * Usage with npm: npm run build:linux -- --build-version <version>
 * Usage with gulp: gulp buildWin --build-version <version>
 */

const RELEASE_DIR = "./releases";

const getOutDir = (pkgTarget: string) => {
  const main = `${RELEASE_DIR}/${pkgTarget}`;
  if (gulpArgs["build-version"]) {
    return `${main}_${gulpArgs["build-version"]}`;
  }
  return main;
};

enum BuildTargets {
  GENERIC = "node14",
  WINDOWS = "node14-win-x64",
  LINUX = "node14-linux-x64",
  MAC = "node14-macos-x64",
  ARMV7 = "node14-linux-armv7",
}

const BuildTargetNames = {
  [BuildTargets.GENERIC]: "generic",
  [BuildTargets.WINDOWS]: "windows",
  [BuildTargets.LINUX]: "linux",
  [BuildTargets.MAC]: "macos",
  [BuildTargets.ARMV7]: "armv7",
};

const MAIN_TARGETS: BuildTargets[] = [BuildTargets.WINDOWS, BuildTargets.LINUX, BuildTargets.MAC];

function checkVersion() {
  const buildVersion = gulpArgs["build-version"];
  if (!buildVersion) {
    console.log("WARN: did not receive version");
  } else if (buildVersion !== packageVersion) {
    throw new Error(`argument build version "${buildVersion}" is not the same as the version in package.json: "${packageVersion}"`);
  } else if (packageVersion !== assetsVersion) {
    throw new Error(`package.json version "${packageVersion}" is not the same as the version in assets/version.json: "${assetsVersion}"`);
  }
}

async function copy(source: string, target: string) {
  return new Promise((resolve, reject) => {
    src(source).pipe(dest(target)).on("end", resolve).on("error", reject);
  });
}

async function execAsync(cmd: string, opts: ExecOptions = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      if (err) {
        reject(err);
      } else {
        resolve(stdout || stderr);
      }
    });
  });
}

export async function installApp() {
  return execAsync("npm ci", { cwd: "./app" });
}

export async function buildApp() {
  return execAsync("npm run build", { cwd: "./app" });
}

async function runVersionScript() {
  return execAsync("node version");
}

async function transpileProd() {
  return execAsync("npm run transpile:prod");
}

async function packageServer(target: BuildTargets, outPath: string) {
  return execAsync(
    `npx pkg . --targets ${target} --options max_old_space_size=8192 --out-path ${outPath}`
  );
}

async function buildServer(pkgTarget: BuildTargets, outDir: string) {
  await runVersionScript();
  await transpileProd();
  await packageServer(pkgTarget, outDir);
}
async function buildPlatform(pkgTarget: BuildTargets) {
  checkVersion();

  const outDir = getOutDir(pkgTarget);

  mkdirSync(`${outDir}/app/dist`, { recursive: true });

  await Promise.all([
    copy("./views/**/*", `${outDir}/views`),
    copy("./assets/**/*", `${outDir}/assets`),
    (async () => {
      await buildApp();
      await copy("./app/dist/**/*", `${outDir}/app/dist`);
    })(),
    buildServer(pkgTarget, outDir),
  ]);
}

async function zipRelease(buildTarget: BuildTargets) {
  checkVersion();

  const friendlyTargetName = BuildTargetNames[buildTarget];

  const finalOutZip = gulpArgs["build-version"]
    ? `porn-vault_${gulpArgs["build-version"]}_${friendlyTargetName}.zip`
    : `porn-vault_${friendlyTargetName}.zip`;

  return new Promise((resolve, reject) => {
    src(`${getOutDir(buildTarget)}/**/*`)
      .pipe(zip(finalOutZip))
      .pipe(dest(RELEASE_DIR))
      .on("end", resolve)
      .on("error", reject);
  });
}

const PlatformsFunctions = Object.values(BuildTargets).reduce((platforms, target) => {
  platforms[target] = {
    build: () => buildPlatform(target),
    zip: () => zipRelease(target),
  };
  return platforms;
}, {}) as {
  [key in BuildTargets]: {
    build: () => Promise<void>;
    zip: () => Promise<void>;
  };
};

export const buildGeneric = PlatformsFunctions[BuildTargets.GENERIC].build;
export const zipGeneric = PlatformsFunctions[BuildTargets.GENERIC].zip;

export const buildWindows = PlatformsFunctions[BuildTargets.WINDOWS].build;
export const zipWindows = PlatformsFunctions[BuildTargets.WINDOWS].zip;

export const buildLinux = PlatformsFunctions[BuildTargets.LINUX].build;
export const zipLinux = PlatformsFunctions[BuildTargets.LINUX].zip;

export const buildMac = PlatformsFunctions[BuildTargets.MAC].build;
export const zipMac = PlatformsFunctions[BuildTargets.MAC].zip;

export const buildArmv7 = PlatformsFunctions[BuildTargets.ARMV7].build;
export const zipArmv7 = PlatformsFunctions[BuildTargets.ARMV7].zip;

export async function buildAll() {
  checkVersion();

  MAIN_TARGETS.map((pkgTarget) =>
    mkdirSync(`${getOutDir(pkgTarget)}/app/dist`, { recursive: true })
  );

  await Promise.all([
    ...MAIN_TARGETS.flatMap((pkgTarget: string) => [
      copy("./views/**/*", `${getOutDir(pkgTarget)}/views`),
      copy("./assets/**/*", `${getOutDir(pkgTarget)}/assets`),
    ]),
    (async () => {
      await buildApp();
      await Promise.all(
        MAIN_TARGETS.map((pkgTarget) => copy("./app/dist/**/*", `${getOutDir(pkgTarget)}/app/dist`))
      );
    })(),
    (async () => {
      await runVersionScript();
      await transpileProd();
    })(),
  ]);

  await Promise.all(
    MAIN_TARGETS.map((pkgTarget) => packageServer(pkgTarget, getOutDir(pkgTarget)))
  );
}

export async function zipAll() {
  await Promise.all(MAIN_TARGETS.map((pkgTarget) => zipRelease(pkgTarget)));
}
