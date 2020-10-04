<template>
  <v-container fluid>
    <BindTitle value="Settings" />

    <div
      :class="{
        'mx-auto d-flex tabs-container': true,
        'flex-column': !verticalTabs,
      }"
    >
      <v-tabs
        v-model="tab"
        :class="{ 'tabs-list mr-2': true, vertical: verticalTabs }"
        :vertical="verticalTabs"
        :show-arrows="!verticalTabs"
      >
        <v-tab v-for="tab in tabs" :key="tab.id">
          {{ tab.title }}
        </v-tab>
      </v-tabs>

      <!-- Override dark theme background-color: we want sub settings to be visibly distinct from each other -->
      <v-tabs-items
        v-model="tab"
        :class="{ 'tabs-items': true, vertical: verticalTabs }"
        style="background-color: initial"
      >
        <v-tab-item v-for="tab in tabs" :key="tab.id">
          <component class="tab-item-content pl-2" :is="tab.component"></component>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import UI from "@/components/Settings/UI.vue";
import Metadata from "@/components/Settings/Metadata.vue";
import About from "@/components/Settings/About.vue";

@Component({})
export default class Settings extends Vue {
  tab: string = "appearance";
  tabs: { id: string; title: string; component: Vue }[] = [
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

  get verticalTabs() {
    // @ts-ignore
    return this.$vuetify.breakpoint.mdAndUp;
  }
}
</script>

<style lang="scss" scoped>
.tabs-container {
  max-width: 80vw;
}

.tabs-list {
  &.vertical {
    flex: 15%;
    width: 15%;
  }
}

.tabs-items {
  &.vertical {
    flex: 75%;
  }
}
</style>
