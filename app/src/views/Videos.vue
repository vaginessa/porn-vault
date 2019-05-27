<template>
  <div>
    <v-layout row wrap v-if="items.length">
      <v-flex v-for="video in items" :key="video.id" xs6 sm4 md4 lg3>
        <Video :video="video"></Video>
      </v-flex>
    </v-layout>
    <div v-else class="pt-4 headline text-xs-center">
      Drop videos to add to library
      <br>
      <v-icon class="mt-3" style="font-size: 48px">add</v-icon>
    </div>
  </div>
</template>

<script>
import Video from "../components/Video";

export default {
  components: {
    Video
  },
  methods: {},
  computed: {
    items() {
      return this.$store.state.videos.items;
    }
  }
};
</script>

<style>
</style>
