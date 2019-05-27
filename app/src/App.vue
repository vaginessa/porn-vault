<template>
  <v-app dark>
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
import * as library from "@/util/library";

export default {
  name: "App",
  components: {},
  data() {
    return {};
  },
  async beforeMount() {
    library.loadFromDisk();
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
