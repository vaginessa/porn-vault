<template>
  <div class="pv-app">
    <header>
      <!-- Header content -->
      <topbar />
    </header>

    <!-- Navigation -->
    <div class="sidenav"></div>

    <!-- Main content -->
    <main><slot /></main>
  </div>
</template>

<script lang="ts" setup>
import Topbar from "../components/topbar.vue";
</script>

<style>
/* TODO: replace with /assets URL */
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

* {
  transition: color 0.15s ease-in-out;
  transition: background-color 0.15s ease-in-out;
}

a {
  color: inherit;
}

* {
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
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
  /*  background: #1a1a1f; */
}

.pv-app {
  display: grid;

  grid-template-areas:
    "header header header"
    "nav content content"
    "footer footer footer";

  grid-template-columns: 125px 1fr;
  grid-template-rows: auto 1fr auto;

  height: 100vh;
}

.pv-app.dark {
  background: #101015;
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
  .pv-app {
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

.mobile-sidenav {
  background: #fafafa;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  border-right: 1px solid #f0f0f0;
  position: fixed;
  width: 60%;
  height: 100%;
}

.pv-app.dark .sidenav {
  background: #1b1b23;
  border-color: #151515;
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
