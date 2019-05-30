<template>
  <v-container>
    <div color="primary" class="mb-3 text-xs-center">
      <v-btn large @click="openFileInput">
        <v-icon left>add</v-icon>Add videos
      </v-btn>
    </div>
    <input accept="video/*" type="file" multiple id="file-input-videos" style="display: none">

    <v-layout row wrap v-if="$store.state.videos.items.length">
      <v-flex xs12>
        <v-checkbox hide-details v-model="filterDrawer" label="Advanced options"></v-checkbox>
      </v-flex>

      <v-flex class="mt-3 mb-2" v-for="video in items" :key="video.id" xs6 sm4 md3 lg2 xl2>
        <Video :video="video"></Video>
      </v-flex>
    </v-layout>

    <v-navigation-drawer
      class="pa-3"
      v-model="filterDrawer"
      app
      right
      clipped
      :permanent="filterDrawer"
      disable-resize-watcher
      hide-overlay
    >
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field v-model="search" single-line label="Search..." clearable></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-divider></v-divider>
          <v-subheader>Filter</v-subheader>
          <v-autocomplete
            v-model="chosenActors"
            :items="$store.state.actors.items"
            chips
            label="Select actor(s)"
            item-text="name"
            item-value="id"
            multiple
            clearable
            hide-details
            single-line
          >
            <template v-slot:selection="data">
              <v-chip
                :selected="data.selected"
                close
                class="chip--select-multi"
                @input="removeActor(data.item.id)"
              >
                <v-avatar>
                  <img :src="$store.getters['images/idToPath'](data.item.thumbnails[0])">
                </v-avatar>
                {{ data.item.name }}
              </v-chip>
            </template>
            <template v-slot:item="data">
              <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-avatar>
                  <img :src="$store.getters['images/idToPath'](data.item.thumbnails[0])">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="data.item.group"></v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </template>
          </v-autocomplete>
        </v-flex>
        <v-flex xs12 class="mt-2">
          <v-autocomplete
            clearable
            v-model="chosenLabels"
            multiple
            chips
            hide-details
            single-line
            :items="labels"
            label="Select labels..."
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12 class="mt-3">
          Filter by rating
          <span v-for="i in 5" :key="i">
            <v-icon @click="setRatingFilter(i)" v-if="i > ratingFilter">star_border</v-icon>
            <v-icon color="amber" @click="setRatingFilter(i)" v-else>star</v-icon>
          </span>
        </v-flex>
        <v-flex xs12>
          <v-checkbox hide-details v-model="favoritesOnly" label="Show favorites only"></v-checkbox>
          <v-checkbox hide-details v-model="bookmarksOnly" label="Show bookmarks only"></v-checkbox>
        </v-flex>
        <v-flex xs12 class="mt-3">
          <v-divider></v-divider>
          <v-subheader>Sort</v-subheader>
          <v-select :items="sortModes" single-line v-model="chosenSort" item-text="name" item-value="value"></v-select>
        </v-flex>
      </v-layout>
    </v-navigation-drawer>
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
      filterDrawer: false,
      search: "",
      chosenLabels: [] as string[],
      chosenActors: [] as string[],
      favoritesOnly: false,
      bookmarksOnly: false,
      ratingFilter: 0,
      chosenSort: 0,
      sortModes: [
        {
          name: "Date added (newest)",
          value: 0
        },
        {
          name: "Date added (oldest)",
          value: 1
        },
        {
          name: "Name - A to Z",
          value: 2
        },
        {
          name: "Name - Z to A",
          value: 3
        },
        {
          name: "Highest rated",
          value: 4
        },
        {
          name: "Lowest rated",
          value: 5
        },
        {
          name: "Most viewed",
          value: 6
        },
        {
          name: "Least viewed",
          value: 7
        }
      ]
    };
  },
  methods: {
    setRatingFilter(i: number) {
      if (this.ratingFilter === i) {
        this.ratingFilter = 0;
      } else {
        this.ratingFilter = i;
      }
    },
    removeActor(id: string) {
      this.chosenActors = this.chosenActors.filter(a => a != id);
    },
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
        videos = videos.filter(video =>
          this.chosenLabels.every(label => video.labels.includes(label))
        );
      }

      if (this.chosenActors.length) {
        videos = videos.filter(video =>
          this.chosenActors.every(actor => video.actors.includes(actor))
        );
      }

      if (this.ratingFilter > 0) {
        videos = videos.filter(v => v.rating >= this.ratingFilter);
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

      switch (this.chosenSort) {
        case 0:
          videos.sort((a, b) => b.addedOn - a.addedOn);
          break;
        case 1:
          videos.sort((a, b) => a.addedOn - b.addedOn);
          break;
        case 2:
          videos.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 3:
          videos.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 4:
          videos.sort((a, b) => b.rating - a.rating);
          break;
        case 5:
          videos.sort((a, b) => a.rating - b.rating);
          break;
        case 6:
          videos.sort((a, b) => b.watches.length - a.watches.length);
          break;
        case 7:
          videos.sort((a, b) => a.watches.length - b.watches.length);
          break;
      }

      return videos as Video[];
    }
  }
});
</script>

<style>
</style>
