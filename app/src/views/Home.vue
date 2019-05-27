<template>
  <div>Home

    <v-btn flat @click="exportLibrary">Export</v-btn>
  </div>
</template>

<script>
import * as library from "../util/library";

export default {
  methods: {
    exportLibrary() {
      library.exportToDisk();
    }
  }
}
</script>

<style>

</style>
