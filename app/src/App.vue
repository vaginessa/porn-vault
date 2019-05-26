<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Manager</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat to="/videos">Videos</v-btn>
    </v-toolbar>

    <v-content>
      <v-container>
        <router-view/>
      </v-container>
    </v-content>

    <Dropper/>
  </v-app>
</template>

<script>
import path from "path";
import fs from "fs";
import Dropper from "./components/Dropper";

export default {
  name: "App",
  components: {
    Dropper
  },
  data() {
    return {
      //
    };
  },
  async beforeMount() {
    const cwd = process.cwd();
    const libraryPath = path.resolve(cwd, "library.json");

    if (fs.existsSync(libraryPath)) {
      const library = JSON.parse(fs.readFileSync(libraryPath, "utf-8"));
      console.log(library);

      if (library.videos) {
        this.$store.commit("videos/set", library.videos);
        console.log("Set videos...");
      }
    } else {
      fs.writeFileSync(libraryPath, "{}", "utf-8");
    }
  }
};
</script>

<style lang="scss">
.sec--text {
  opacity: 0.6;
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
