<template>
  <div>
    <div class="header card">
      <div>
        <nuxt-link style="display: inherit" to="/">
          <img width="32" height="32" src="/assets/favicon.png" alt="" />
        </nuxt-link>
      </div>
      <div style="flex-grow: 1"></div>
      <input @keydown.enter="search" v-model="searchQuery" type="text" placeholder="Find content" />
    </div>

    <main>
      <div v-if="vw > 500" class="sidenav-wrapper">
        <div class="sidenav">
          <sidenav-link :name="link.name" :url="link.url" v-for="link in links" :key="link.name" />
          <!--  <div style="flex-grow: 1"></div> -->
          <sidenav-link name="Settings" url="/settings" />
        </div>
      </div>

      <div class="content-wrapper">
        <Nuxt />
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";

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

    const vw = ref(1080);

    onMounted(() => {
      vw.value = window.innerWidth;
      window.addEventListener(
        "resize",
        () => {
          vw.value = window.innerWidth;
        },
        true
      );
    });

    return {
      searchQuery,
      search,

      links,
      vw,
    };
  },
});
</script>

<style>
/* TODO: replace with /assets URL */
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

a {
  color: inherit;
}

* {
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
}

input {
  cursor: text;
  border: 2px solid #f0f0f0;
  font-weight: 600;
  border-radius: 4px;
  padding: 7px 12px;
  transition: all 0.1s ease-in-out;
  outline: none;
  font-size: 13px;
}

input:hover {
  background: #f0f0f0;
}

input:focus {
  background: #e5e5e5;
  border-color: #e5e5e5 !important;
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

.content-wrapper {
  flex-grow: 1;
}

.header {
  z-index: -200;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
}

.shadow {
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.02), 0 6.7px 5.3px rgba(0, 0, 0, 0.028),
    0 12.5px 10px rgba(0, 0, 0, 0.035), 0 22.3px 17.9px rgba(0, 0, 0, 0.042),
    0 41.8px 33.4px rgba(0, 0, 0, 0.05), 0 100px 80px rgba(0, 0, 0, 0.07);
}

.avatar {
  border-radius: 50%;
}
</style>
