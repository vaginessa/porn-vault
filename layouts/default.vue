<template>
  <div>
    <div class="header card">
      <div style="flex-grow: 1"></div>
      <nuxt-link style="display: inherit" to="/">
        <img width="32" height="32" src="/assets/favicon.png" alt="" />
      </nuxt-link>
      <div style="flex-grow: 1"></div>
      <input @keydown.enter="search" v-model="searchQuery" type="text" placeholder="Find content" />
    </div>

    <main>
      <div class="sidenav-wrapper">
        <div class="sidenav">
          <sidenav-link :name="link.name" :url="link.url" v-for="link in links" :key="link.name" />
          <!--  <div style="flex-grow: 1"></div> -->
          <sidenav-link name="Settings" url="/settings" />
        </div>
      </div>

      <div class="content">
        <Nuxt />
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";

import SidenavLink from "../components/sidenav/link.vue";

export default defineComponent({
  components: {
    SidenavLink,
  },
  setup() {
    const links = [
      {
        name: "Scenes",
        url: "/scenes",
        icon: null,
      },
      {
        name: "Actors",
        url: "/actors",
        icon: null,
      },
      {
        name: "Movies",
        url: "/movies",
        icon: null,
      },
      {
        name: "Studios",
        url: "/studios",
        icon: null,
      },
      {
        name: "Images",
        url: "/images",
        icon: null,
      },
      {
        name: "Markers",
        url: "/markers",
        icon: null,
      },
    ];

    const searchQuery = ref("");

    function search() {
      this.$router.push({
        path: "/search",
        query: {
          q: this.searchQuery,
        },
      });
    }

    return {
      searchQuery,
      search,

      links,
    };
  },
});
</script>

<style>
a {
  color: inherit;
}

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

html {
  overflow-y: scroll;
}

body {
  margin: 0px;
}

main {
  display: flex;
}

.sidenav-wrapper {
  position: relative;
  flex: 0 0 80px;
}

.sidenav {
  background: #fafafa;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding-top: 10px;
  width: 100%;
  height: 100vh;
}

.sidenav > .link {
  padding: 10px;
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
</style>
