<template>
  <SettingsWrapper>
    <div v-for="page in settingsPages" :key="page.path" class="mb-6 d-flex flex-column">
      <span>
        <v-btn class="pl-2 text-none" text :to="page.path" exact>
          <h3>{{ page.meta.title }}</h3>
        </v-btn>
      </span>
      <span class="body-2 pl-2">{{ page.meta.description }}</span>
    </div>
  </SettingsWrapper>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import DrawerMixin from "@/mixins/drawer";
import SettingsWrapper from "@/components/SettingsWrapper.vue";

import { routes } from "@/router";

@Component({
  components: {
    SettingsWrapper,
  },
})
export default class Settings extends mixins(DrawerMixin) {
  get settingsPages() {
    return routes.filter(
      (route) => route.path.startsWith("/settings") && route.path !== "/settings"
    );
  }
}
</script>
