<template>
  <v-container fluid>
    <BindTitle value="Settings" />

    <div class="mx-auto d-flex flex-column tabs-container">
      <v-navigation-drawer v-if="showSidenav" style="z-index: 14" v-model="drawer" clipped app>
        <v-tabs v-model="tab" vertical>
          <v-tab v-for="tab in tabs" :key="tab.id">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </v-navigation-drawer>

      <!-- Override dark theme background-color: we want sub settings to be visibly distinct from each other -->
      <v-tabs-items v-model="tab" class="tabs-items" style="background-color: initial">
        <v-tab-item v-for="tab in tabs" :key="tab.id">
          <component class="tab-item-content pl-2" :is="tab.component"></component>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import UI from "@/components/Settings/UI.vue";
import Metadata from "@/components/Settings/Metadata.vue";
import About from "@/components/Settings/About.vue";
import DrawerMixin from "@/mixins/drawer";
import { contextModule } from "@/store/context";
import { VueConstructor } from "vue";

@Component({})
export default class Settings extends mixins(DrawerMixin) {
  tab: string = "appearance";
  tabs: { id: string; title: string; component: VueConstructor }[] = [
    {
      id: "ui",
      title: "UI",
      component: UI,
    },
    {
      id: "metadata",
      title: "Metadata",
      component: Metadata,
    },
    {
      id: "about",
      title: "about",
      component: About,
    },
  ];

  get showSidenav() {
    return contextModule.showSidenav;
  }
}
</script>

<style lang="scss" scoped>
.tabs-container {
}

.tabs-list {
}

.tabs-items {
}
</style>
