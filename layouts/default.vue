<template>
  <div>
    <div class="header card">
      <button @click="toggleSidenav">Sidenav</button>
      <div style="flex-grow: 1"></div>
      <nuxt-link style="display: inherit" to="/">
        <img width="32" height="32" src="/assets/favicon.png" alt="" />
      </nuxt-link>
      <div style="flex-grow: 1"></div>
      <input @keydown.enter="search" v-model="searchQuery" type="text" placeholder="Find content" />
    </div>

    <main>
      <div
        class="sidenav"
        :style="{
          width: `${sidenavWidth}px`,
        }"
      ></div>
      <div class="content">
        <Nuxt />
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  data() {
    return {
      searchQuery: "",
      sidenavWidth: 0,
    };
  },
  methods: {
    toggleSidenav() {
      if (this.sidenavWidth === 0) {
        this.sidenavWidth = 200;
      } else {
        this.sidenavWidth = 0;
      }
    },
    search() {
      this.$router.push({
        path: "/search",
        query: {
          q: this.searchQuery,
        },
      });
    },
  },
});
</script>

<style>
* {
  box-sizing: border-box;
}

.rounded {
  border-radius: 10px;
}

.hover {
  transition: filter 0.1s ease-in-out;
  cursor: pointer;
}

.hover:hover {
  filter: brightness(0.8);
}

body {
  margin: 0px;
}

main {
  display: flex;
}

.sidenav {
  background: #fafafa;
  z-index: -100;
  transition: width 0.25s ease-in-out;
}

.content {
  padding: 10px;
  flex-grow: 1;
}

.header {
  z-index: -200;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px !important;
}

.card {
  background: white;
}
</style>
