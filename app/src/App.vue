<template>
  <v-app>
    <v-app-bar elevate-on-scroll app color="primary">
      <span class="title font-weight-light">porn-manager</span>

      <v-spacer></v-spacer>
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

@Component
export default class App extends Vue {}
</script>
