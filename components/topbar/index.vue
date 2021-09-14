<template>
  <div class="topbar-wrapper flex">
    <div class="hover">
      <nuxt-link style="display: inherit" to="/">
        <img width="32" height="32" src="/assets/favicon.png" alt="" />
      </nuxt-link>
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
import { defineComponent, ref, useRouter } from "@nuxtjs/composition-api";
import PvInput from "../input.vue";

export default defineComponent({
  components: { PvInput },
  setup() {
    const router = useRouter();

    const searchQuery = ref("");

    function search() {
      router.push({
        path: "/search",
        query: {
          q: searchQuery.value,
        },
      });
    }

    return {
      searchQuery,
      search,
    };
  },
});
</script>

<style scoped>
.topbar-wrapper {
  width: 100%;
  border-bottom: 1px solid #f0f0f0;
  padding: 8px;
}
</style>
