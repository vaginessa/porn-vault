<template>
  <div>
    <div class="header card">
      <div style="flex-grow: 1"></div>
      <nuxt-link style="display: inherit" to="/">
        <img width="32" height="32" src="/assets/favicon.png" alt="" />
      </nuxt-link>
      <div style="flex-grow: 1"></div>
    </div>
    <div style="padding: 10px">
      <Nuxt />
    </div>
  </div>
</template>

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

.header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px 0px;
}

.card {
  background: white;
}
</style>
