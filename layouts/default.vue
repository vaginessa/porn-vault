<template>
  <div>
    <div class="header">
      <div style="flex-grow: 1"></div>
      <img width="32" height="32" src="/assets/favicon.png" alt="" />
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
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
}
</style>
