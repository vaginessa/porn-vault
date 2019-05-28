import path from "path";
import fs from "fs";

import store from "@/store";

import Video from "@/classes/video";
import Actor from "@/classes/actor";
import Image from "@/classes/image";

export function exportToDisk(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const cwd = process.cwd();
      const libraryPath = path.resolve(cwd, "library/");

      if (!fs.existsSync(libraryPath))
        fs.mkdirSync(libraryPath);

      const videoPath = path.resolve(libraryPath, "videos.json");
      fs.writeFileSync(videoPath, JSON.stringify(store.getters["videos/getAll"]), "utf-8");

      const actorPath = path.resolve(libraryPath, "actors.json");
      fs.writeFileSync(actorPath, JSON.stringify(store.getters["actors/getAll"]), "utf-8");

      const imagePath = path.resolve(libraryPath, "images.json");
      fs.writeFileSync(imagePath, JSON.stringify(store.getters["images/getAll"]), "utf-8");

      const settingsPath = path.resolve(libraryPath, "settings.json");
      fs.writeFileSync(settingsPath, JSON.stringify(store.getters["globals/get"]), "utf-8");

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
    const libraryPath = path.resolve(cwd, "library/");

    if (fs.existsSync(libraryPath)) {
      const videoPath = path.resolve(libraryPath, "videos.json");
      const actorPath = path.resolve(libraryPath, "actors.json");
      const imagePath = path.resolve(libraryPath, "images.json");
      const settingsPath = path.resolve(libraryPath, "settings.json");

      const videos = JSON.parse(fs.readFileSync(videoPath, "utf-8"));
      const actors = JSON.parse(fs.readFileSync(actorPath, "utf-8"));
      const images = JSON.parse(fs.readFileSync(imagePath, "utf-8"));
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));

      if (videos && Array.isArray(videos)) {
        store.commit(
          "videos/set",
          videos.map((o: any) => Object.assign(new Video(), o))
        );
      }

      if (actors && Array.isArray(actors)) {
        store.commit(
          "actors/set",
          actors.map((o: any) => Object.assign(new Actor(), o))
        );
      }

      if (images && Array.isArray(images)) {
        store.commit(
          "images/set",
          images.map((o: any) => Object.assign(new Image(), o))
        );
      }

      if (settings) {
        store.commit("globals/set", settings);
      }
    } else {
      exportToDisk();
    }

    resolve();
  })
}