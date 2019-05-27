<template>
  <div>
    <div color="primary" class="mb-3 text-xs-center">
      <v-btn large @click="openFileInput">
        <v-icon left>add</v-icon>Add videos
      </v-btn>
    </div>
    <input accept="video/*" type="file" multiple id="file-input-videos" style="display: none">
    <v-layout row wrap v-if="items.length">
      <v-flex v-for="video in items" :key="video.id" xs6 sm4 md4 lg3>
        <Video :video="video" v-on:open="expand(video)"></Video>
      </v-flex>
    </v-layout>

    <VideoDetails :value="visible" :video="current" v-on:close="visible = false"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VideoComponent from "@/components/Video.vue";
import Video from "@/classes/video";
import VideoDetails from "@/components/VideoDetails.vue";

export default Vue.extend({
  components: {
    Video: VideoComponent,
    VideoDetails
  },
  data() {
    return {
      current: null as Video | null,
      visible: false
    };
  },
  methods: {
    expand(video: Video) {
      this.current = video;
      this.visible = true;
    },
    openFileInput() {
      let el = document.getElementById(`file-input-videos`) as any;

      el.addEventListener("change", (ev: Event) => {
        let files = Array.from(el.files) as File[];

        // Ignore already added videos
        files = files.filter(
          file => !this.$store.getters["videos/getByPath"](file.path)
        );

        if (files.length) this.$store.dispatch("videos/add", files);
      });
      el.click();
    }
  },
  computed: {
    items(): Video[] {
      return this.$store.state.videos.items;
    }
  }
});
</script>

<style>
</style>
