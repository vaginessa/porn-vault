<template>
  <div class="topbar-wrapper flex">
    <div class="hover">
      <a style="display: inherit" to="/">
        <img width="32" height="32" src="/assets/favicon.png" alt="" />
      </a>
    </div>
    <div
      @click="$emit('openSideNav')"
      class="menu-btn hover flex"
      style="opacity: 0.66; margin-left: 8px; align-items: center"
    >
      <MenuIcon />
    </div>
    <div style="flex-grow: 1"></div>
    <pv-input
      @keydown.enter="search"
      v-model="searchQuery"
      type="text"
      placeholder="Find content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import PvInput from "./input.vue";
import MenuIcon from "vue-material-design-icons/Menu.vue";

export default defineComponent({
  components: { PvInput, MenuIcon },
  setup() {
    const searchQuery = ref("");

    function search() {
      /* router.push({
        path: "/search",
        query: {
          q: searchQuery.value,
        },
      }); */
    }

    return {
      searchQuery,
      search,
    };
  },
});
</script>

<style scoped>
@media (min-width: 769px) {
  .menu-btn {
    display: none;
  }
}

.topbar-wrapper {
  width: 100%;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px;
}

.pv-app.dark .topbar-wrapper {
  background: #1b1b23;
  border-color: #151515;
}
</style>
