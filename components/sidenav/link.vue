<template>
  <nuxt-link :to="url" class="link">
    <div class="icon">
      <slot name="icon" />
    </div>
    <div>{{ name }}</div>
  </nuxt-link>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
  },
});
</script>

<style scoped>
.link {
  display: flex;
  align-items: center;
  justify-content: start;
  background: transparent;
  padding: 12px 0;
  transition: background-color 0.05s ease-in-out;
  transition: border-color 0.05s ease-in-out;
  border-right: 4px solid transparent;
}

.pv-app.dark .link {
  color: white;
}

.link:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 40, 80, 0.33);
}

.pv-app.dark .link:hover {
  border-color: rgba(255, 40, 80, 0.5);
}

.nuxt-link-active {
  font-weight: bold;
  border-color: rgba(255, 80, 160, 255) !important;
  background: #f0f0f0;
}

.pv-app.dark .nuxt-link-active {
  background: #262631;
  border-color: rgba(255, 80, 160, 200) !important;
}

.icon {
  margin: 0 8px;
}
</style>
