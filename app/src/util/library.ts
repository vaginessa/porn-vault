import fs from "fs";
import path from "path";

import store from "@/store";

export function exportToDisk(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const cwd = process.cwd();
      const libraryPath = path.resolve(cwd, "library.json");

      fs.writeFileSync(libraryPath, JSON.stringify({
        videos: store.getters["videos/getAll"],
        actors: store.getters["actors/getAll"],
      }), "utf-8");

      resolve();
    }
    catch (err) {
      reject(err);
    }
  })
}