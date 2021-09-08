<template>
  <div class="page-container">
    <header>
      <!-- Header content -->
      <div>
        <nuxt-link style="display: inherit" to="/">
          <img width="32" height="32" src="/assets/favicon.png" alt="" />
        </nuxt-link>
      </div>
      <div style="flex-grow: 1"></div>
      <input @keydown.enter="search" v-model="searchQuery" type="text" placeholder="Find content" />
    </header>

    <nav v-if="vw > 768">
      <!-- Navigation -->
      <div class="sidenav">
        <sidenav-link :name="link.name" :url="link.url" v-for="link in links" :key="link.name" />

        <div style="flex-grow: 1"></div>

        <nuxt-link style="display: inherit" to="/about">
          <img width="32" height="32" src="/assets/favicon.png" alt="" />
        </nuxt-link>
        <div style="margin-top: 5px; font-weight: bold; opacity: 0.66; font-size: 13px">
          {{ version }}
        </div>
      </div>
    </nav>

    <main>
      <!-- Main content -->
      <Nuxt style="margin-bottom: 20px" />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, useRouter } from "@nuxtjs/composition-api";
import axios from "axios";
import { getUrl } from "../client/util/url";

import SidenavLink from "../components/sidenav/link.vue";

async function fetchVersion(): Promise<string> {
  const res = await axios.get<{ result: string }>(getUrl("/api/version", process.server));
  return res.data.result;
}

export default defineComponent({
  components: {
    SidenavLink,
  },
  setup() {
    const router = useRouter();

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
      {
        name: "Settings",
        url: "/settings",
        icon: null,
      },
    ];

    const searchQuery = ref("");

    function search() {
      router.push({
        path: "/search",
        query: {
          q: searchQuery.value,
        },
      });
    }

    const vw = ref(1080);

    const version = ref("");

    onMounted(async () => {
      vw.value = window.innerWidth;
      window.addEventListener(
        "resize",
        () => {
          vw.value = window.innerWidth;
        },
        true
      );
      fetchVersion().then((result) => {
        version.value = result;
      });
    });

    return {
      searchQuery,
      search,

      links,
      vw,

      version,
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

.hover:not(.inverted):hover {
  filter: brightness(0.8);
}

.hover.inverted:hover {
  filter: invert(0.25);
}

a {
  transition: color 0.1s ease-in-out;
}

a:hover {
  color: #660055;
}

body {
  margin: 0px;
  height: 100vh;
}

.page-container {
  display: grid;

  grid-template-areas:
    "header header header"
    "nav content content"
    "footer footer footer";

  grid-template-columns: 100px 1fr;
  grid-template-rows: auto 1fr auto;

  height: 100vh;
}

header {
  grid-area: header;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  grid-area: nav;
}

main {
  grid-area: content;
  overflow: scroll;
}

@media (max-width: 768px) {
  .page-container {
    grid-template-areas:
      "header"
      "content"
      "footer";

    grid-template-columns: 1fr;
    grid-template-rows:
      auto /* Header */
      minmax(75px, auto) /* Nav */
      1fr /* Content */
      minmax(75px, auto) /* Sidebar */
      auto; /* Footer */
  }

  nav,
  aside {
    margin: 0;
  }
}

.sidenav {
  background: #fafafa;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
  width: 100%;
  height: 100%;
}

.sidenav > .link {
  padding: 10px;
}

.content-wrapper {
  flex-grow: 1;
}

.shadow {
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.02), 0 6.7px 5.3px rgba(0, 0, 0, 0.028),
    0 12.5px 10px rgba(0, 0, 0, 0.035), 0 22.3px 17.9px rgba(0, 0, 0, 0.042),
    0 41.8px 33.4px rgba(0, 0, 0, 0.05), 0 100px 80px rgba(0, 0, 0, 0.07);
}

.avatar {
  border-radius: 50%;
}

hr {
  height: 1px;
  opacity: 0.1;
}
</style>
