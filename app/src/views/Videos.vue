<template>
  <v-container>
    <div color="primary" class="mb-3 text-xs-center">
      <v-btn large @click="openFileInput">
        <v-icon left>add</v-icon>Add videos
      </v-btn>
    </div>
    <input accept="video/*" type="file" multiple id="file-input-videos" style="display: none">

    <v-layout row wrap v-if="$store.state.videos.items.length">
      <v-flex xs12 sm8 md6>
        <v-text-field v-model="search" label="Search..." clearable></v-text-field>
      </v-flex>
      <v-flex xs0 sm4 md6></v-flex>
      <v-flex xs12 sm8 md6>
        <v-autocomplete
          clearable
          v-model="chosenLabels"
          multiple
          chips
          :items="labels"
          label="Select labels..."
        ></v-autocomplete>
      </v-flex>
      <v-flex xs0 sm4 md6></v-flex>
      <v-flex xs12>
        <v-checkbox hide-details v-model="favoritesOnly" label="Show favorites only"></v-checkbox>
        <v-checkbox hide-details v-model="bookmarksOnly" label="Show bookmarks only"></v-checkbox>
      </v-flex>
      <v-flex class="mt-3 mb-2" v-for="video in items" :key="video.id" xs6 sm4 md3 lg2>
        <Video :video="video"></Video>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import VideoComponent from "@/components/Video.vue";
import Video from "@/classes/video";
import Fuse from "fuse.js";

export default Vue.extend({
  components: {
    Video: VideoComponent
  },
  data() {
    return {
      current: null as Video | null,
      visible: false,

      // TODO: this should all go to store so it's persistent
      search: "",
      chosenLabels: [],
      favoritesOnly: false,
      bookmarksOnly: false
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
    labels(): string[] {
      return this.$store.getters["videos/getLabels"];
    },
    items(): Video[] {
      let videos = JSON.parse(
        JSON.stringify(this.$store.state.videos.items)
      ) as any[];

      if (this.favoritesOnly) {
        videos = videos.filter(video => video.favorite);
      }

      if (this.bookmarksOnly) {
        videos = videos.filter(video => video.bookmark);
      }

      if (this.chosenLabels.length) {
        videos = videos.filter(video => this.chosenLabels.every(label => video.labels.includes(label)));
      }

      videos.forEach(video => {
        video.actors = video.actors.map((id: string) => {
          return this.$store.getters["actors/getById"](id);
        });
      });

      if (this.search && this.search.length) {
        var options = {
          shouldSort: true,
          threshold: 0.25,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ["title", "labels", "actors.name"]
        };
        var fuse = new Fuse(videos, options); // "list" is the item array
        videos = fuse.search(this.search);
      }

      return videos as Video[];
    }
  }
});
</script>

<style>
</style>
