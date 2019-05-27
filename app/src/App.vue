<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Manager</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat to="/">
        <span class="mr-2">Home</span>
      </v-btn>
      <v-btn flat to="/videos">
        <span class="mr-2">Videos</span>
      </v-btn>
      <v-btn flat to="/actors">
        <span class="mr-2">Actors</span>
      </v-btn>
      <v-btn flat to="/settings">
        <span class="mr-2">Settings</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container>
        <router-view/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import path from "path";
import fs from "fs";
import Video from "./classes/video";
import Actor from "./classes/actor";

export default {
  name: "App",
  components: {},
  data() {
    return {};
  },
  async beforeMount() {
    const cwd = process.cwd();
    const libraryPath = path.resolve(cwd, "library.json");

    if (fs.existsSync(libraryPath)) {
      const library = JSON.parse(fs.readFileSync(libraryPath, "utf-8"));
      console.log(library);

      if (library.videos && library.videos.length) {
        this.$store.commit(
          "videos/set",
          library.videos.map(o => Object.assign(new Video(), o))
        );
      }

      if (library.actors && library.actors.length) {
        this.$store.commit(
          "actors/set",
          library.actors.map(o => Object.assign(new Actor(), o))
        );
      }

      if (library.settings) {
        this.$store.commit("globals/setSettings", library.settings);
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
  }
};
</script>

<style lang="scss">
.sec--text {
  opacity: 0.6;
}

.fill {
  width: 100%;
  height: 100%;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.fixed-center {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
