<template>
  <v-app>
    <v-app-bar elevate-on-scroll app color="primary">
      <v-app-bar-nav-icon @click="drawer = true" v-if="$vuetify.breakpoint.xsOnly"></v-app-bar-nav-icon>

      <span v-else>
        <v-btn v-for="item in navItems" :key="item.icon" class="mr-2 text-none" text :to="item.url">
          <v-icon left>{{ item.icon }}</v-icon>
          {{ item.text }}
        </v-btn>
      </span>

      <v-spacer></v-spacer>

      <template
        v-slot:extension
        v-if="$route.name == 'scene-details' || $route.name == 'actor-details'"
      >
        <scene-details-bar v-if="$route.name == 'scene-details'" />
        <actor-details-bar v-if="$route.name == 'actor-details'" />
      </template>
    </v-app-bar>

    <v-navigation-drawer temporary app v-model="drawer">
      <v-list nav>
        <v-list-item :to="item.url" v-for="item in navItems" :key="item.icon">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>{{ item.text }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

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
import { actorModule } from "./store/actor";
import { serverBase } from "./apollo";
import SceneDetailsBar from "./components/AppBar/SceneDetails.vue";
import ActorDetailsBar from "./components/AppBar/ActorDetails.vue";

@Component({
  components: {
    SceneDetailsBar,
    ActorDetailsBar
  }
})
export default class App extends Vue {
  drawer = false;

  beforeCreate() {
    if ((<any>this).$route.query.password) {
      localStorage.setItem("password", (<any>this).$route.query.password);
    }
  }

  navItems = [
    {
      icon: "mdi-camcorder-box",
      text: "Scenes",
      url: "/scenes"
    },
    {
      icon: "mdi-account-multiple",
      text: "Actors",
      url: "/actors"
    },
    {
      icon: "mdi-label",
      text: "Labels",
      url: "/labels"
    }
  ];
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