<template>
  <v-container>
    <div color="primary" class="mb-3 text-xs-center">
      <v-btn large @click="createDialog = true">
        <v-icon left>add</v-icon>Add Actor
      </v-btn>
    </div>

    <!-- {{ $store.state.actors.items }} -->

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
      <v-flex class="mt-3 mb-4" v-for="actor in items" :key="actor.id" xs6 sm4 md3 lg2>
        <Actor :actor="actor" v-on:open="expand(actor)"></Actor>
      </v-flex>
    </v-layout>

    <v-dialog v-model="createDialog" max-width="600px">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Add actor</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-layout row wrap align-center>
            <v-flex xs6 sm4>
              <v-subheader>Actor name</v-subheader>
            </v-flex>
            <v-text-field single-line v-model="creating.name" label="Enter a name"></v-text-field>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat>Cancel</v-btn>
          <v-btn @click="addActor" outline color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Actor from "@/classes/actor";
import ActorComponent from "@/components/Actor.vue";
import { toTitleCase } from "@/util/string";
import Fuse from "fuse.js";

export default Vue.extend({
  components: {
    Actor: ActorComponent
  },
  data() {
    return {
      createDialog: false,
      creating: {
        name: ""
      },

      // TODO: this should all go to store so it's persistent
      search: "",
      chosenLabels: [] as string[],
      favoritesOnly: false,
      bookmarksOnly: false,
      ratingFilter: 0
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
    addActor() {
      let actor = Actor.create(toTitleCase(this.creating.name));
      this.$store.commit("actors/add", actor);
      this.createDialog = false;
    }
  },
  computed: {
    labels(): string[] {
      return this.$store.getters["actors/getLabels"];
    },
    items(): Actor[] {
      let actors = JSON.parse(
        JSON.stringify(this.$store.state.actors.items)
      ) as Actor[];

      if (this.favoritesOnly) {
        actors = actors.filter(actor => actor.favorite);
      }

      if (this.bookmarksOnly) {
        actors = actors.filter(actor => actor.bookmark);
      }

      if (this.chosenLabels.length) {
        actors = actors.filter(actor =>
          this.chosenLabels.every(label => actor.labels.includes(label))
        );
      }

      if (this.ratingFilter > 0) {
        actors = actors.filter(v => v.rating >= this.ratingFilter);
      }

      if (this.search && this.search.length) {
        var options = {
          shouldSort: true,
          threshold: 0.25,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ["name", "labels"]
        };
        var fuse = new Fuse(actors, options); // "list" is the item array
        actors = fuse.search(this.search);
      }

      return actors;
    }
  }
});
</script>

<style>
</style>
