<template>
  <v-app>
    <v-app-bar elevate-on-scroll app color="primary">
      <!-- <span class="title font-weight-light">porn-manager</span> -->
      <v-btn class="mr-2 text-none" text to="/scenes">
        <v-icon left>mdi-camcorder-box</v-icon>Scenes
      </v-btn>
      <v-btn class="mr-2 text-none" text to="/actors">
        <v-icon left>mdi-account-multiple</v-icon>Actors
      </v-btn>
      <v-btn class="mr-2 text-none" text to="/labels">
        <v-icon left>mdi-label</v-icon>Labels
      </v-btn>
      <v-spacer></v-spacer>

      <template v-slot:extension v-if="$route.name == 'scene-details'">
        <div class="d-flex align-center" v-if="$route.name == 'scene-details' && currentScene">
          <v-btn class="mr-2" icon @click="$router.go(-1)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-toolbar-title class="mr-2 title">{{ currentScene.name }}</v-toolbar-title>

          <v-btn target="_blank" :href="currentSceneURL" icon>
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-content>
      <v-container>
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { sceneModule } from "./store/scene";
import { serverBase } from "./apollo";

@Component
export default class App extends Vue {
  get currentScene() {
    return sceneModule.current;
  }

  get currentSceneURL() {
    if (this.currentScene)
      return `${serverBase}/scene/${
        this.currentScene.id
      }?pass=${localStorage.getItem("password")}`;
  }
}
</script>

<style lang="scss">
.hover {
  &:hover {
    cursor: pointer;
  }
}

.med--text {
  opacity: 0.6;
}
</style>