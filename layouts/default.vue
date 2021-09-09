<template>
  <div class="page-container">
    <header>
      <!-- Header content -->
      <Topbar />
    </header>

    <nav v-if="vw > 768">
      <!-- Navigation -->
      <div class="sidenav">
        <sidenav-link :name="link.name" :url="link.url" v-for="link in links" :key="link.name">
          <template #icon>
            <component :is="link.icon" />
          </template>
        </sidenav-link>

        <div style="flex-grow: 1"></div>

        <div style="text-align: center">
          <nuxt-link style="display: inherit" to="/about">
            <img width="32" height="32" src="/assets/favicon.png" alt="" />
          </nuxt-link>
          <div style="font-weight: bold; opacity: 0.66; font-size: 14px">
            {{ version }}
          </div>
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
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";
import axios from "axios";
import { getUrl } from "../client/util/url";
import VideoIcon from "vue-material-design-icons/Video.vue";
import FilmstripBoxMultipleIcon from "vue-material-design-icons/FilmstripBoxMultiple.vue";
import AccountIcon from "vue-material-design-icons/Account.vue";
import CameraIcon from "vue-material-design-icons/Camera.vue";
import ImageMultipleIcon from "vue-material-design-icons/ImageMultiple.vue";
import AnimationPlayIcon from "vue-material-design-icons/AnimationPlay.vue";
/* import CogIcon from "vue-material-design-icons/Cog.vue"; */

import SidenavLink from "../components/sidenav/link.vue";
import Topbar from "../components/topbar/index.vue";

async function fetchVersion(): Promise<string> {
  const res = await axios.get<{ result: string }>(getUrl("/api/version", process.server));
  return res.data.result;
}

export default defineComponent({
  components: {
    SidenavLink,
    Topbar,
  },
  setup() {
    const links = [
      {
        name: "Scenes",
        url: "/scenes",
        icon: VideoIcon,
      },
      {
        name: "Actors",
        url: "/actors",
        icon: AccountIcon,
      },
      {
        name: "Movies",
        url: "/movies",
        icon: FilmstripBoxMultipleIcon,
      },
      {
        name: "Studios",
        url: "/studios",
        icon: CameraIcon,
      },
      {
        name: "Images",
        url: "/images",
        icon: ImageMultipleIcon,
      },
      {
        name: "Markers",
        url: "/markers",
        icon: AnimationPlayIcon,
      },
      /*  {
        name: "Settings",
        url: "/settings",
        icon: CogIcon,
      }, */
    ];

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

  grid-template-columns: 120px 1fr;
  grid-template-rows: auto 1fr auto;

  height: 100vh;
}

header {
  grid-area: header;
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

.flex {
  display: flex;
}

.flex.align-center {
  align-items: center;
}

.flex.content-center {
  justify-content: center;
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
  padding-bottom: 10px;
  width: 100%;
  height: 100%;
  border-right: 1px solid #f0f0f0;
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
