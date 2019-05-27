import path from "path";
import fs from "fs";

import store from "@/store";

import Video from "@/classes/video";
import Actor from "@/classes/actor";

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

export function loadFromDisk(): Promise<void> {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const libraryPath = path.resolve(cwd, "library.json");

    if (fs.existsSync(libraryPath)) {
      const library = JSON.parse(fs.readFileSync(libraryPath, "utf-8"));

      if (library.videos && Array.isArray(library.videos)) {
        store.commit(
          "videos/set",
          library.videos.map((o: any) => Object.assign(new Video(), o))
        );
      }

      if (library.actors && Array.isArray(library.videos)) {
        store.commit(
          "actors/set",
          library.actors.map((o: any) => Object.assign(new Actor(), o))
        );
      }

      if (library.settings) {
        store.commit("globals/setSettings", library.settings);
      }
    } else {
      fs.writeFileSync(
        libraryPath,
        JSON.stringify({
          videos: [],
          actors: [],
          settings: {}
        }),
        "utf-8"
      );
    }

    resolve();
  })
}