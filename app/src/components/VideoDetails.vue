<template>
  <div v-if="video">
    <v-dialog :value="value" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="$emit('close')">
            <v-icon>chevron_left</v-icon>
          </v-btn>
          <v-toolbar-title class="mr-2">{{video.title}}</v-toolbar-title>
          <v-btn icon dark @click="playVideo">
            <v-icon>play_arrow</v-icon>
          </v-btn>
          <v-btn icon dark @click>
            <v-icon>{{ video.favorite ? 'favorite' : 'favorite_border' }}</v-icon>
          </v-btn>
          <v-btn icon dark @click>
            <v-icon>{{ video.bookmark ? 'bookmark' : 'bookmark_border' }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="openEditDialog">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn icon dark @click>
            <v-icon color="error">delete_forever</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-layout row wrap>
            <v-flex xs6 sm4 md3 lg2>
              <v-img
                v-if="video.thumbnails.length"
                class="thumb elevation-6"
                v-ripple
                :aspect-ratio="1"
                :src="video.thumbnails[video.coverIndex]"
                @click="openFileInput"
              ></v-img>
              <v-img
                @click="openFileInput"
                v-else
                class="elevation-6 thumb"
                :aspect-ratio="1"
                src
                style="background: grey"
              ></v-img>
              <input accept="image/*" multiple style="display:none" type="file" :data-id="video.id">
            </v-flex>
            <v-flex xs6 sm8 md9 lg10>
              <v-container fluid fill-height>
                <div class="fill">
                  <span v-for="i in 5" :key="i">
                    <v-icon v-if="i > video.rating">star_border</v-icon>
                    <v-icon v-else>star</v-icon>
                  </span>
                </div>
              </v-container>
            </v-flex>

            <v-flex class="py-5" xs12 v-if="video.actors.length">
              <p class="text-xs-center title font-weight-regular">Featuring</p>
              <v-layout row wrap>
                <v-flex v-for="actor in actors" :key="actor.id" xs6 sm4 md4 lg3>
                  <Actor :actor="actor"></Actor> 
                  <!-- @click = open actor page -->
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex
              xs12
              sm10
              offset-sm1
              md8
              offset-md2
              lg6
              offset-lg3
              v-if="video.thumbnails.length > 1"
            >
              <p class="text-xs-center title font-weight-regular">Images</p>
              <v-checkbox v-model="cycle" label="Auto-cycle images"></v-checkbox>
              <v-carousel :cycle="cycle">
                <v-carousel-item v-for="(item,i) in video.thumbnails" :key="i" :src="item">
                  <v-btn @click="setCoverIndex(i)" icon class="thumb-btn" large>
                    <v-icon>photo</v-icon>
                  </v-btn>
                </v-carousel-item>
              </v-carousel>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Edit {{video.title}}</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-layout row wrap align-center>
            <v-flex xs6 sm4>
              <v-subheader>Video title</v-subheader>
            </v-flex>
            <v-text-field single-line v-model="editing.title" label="Enter title"></v-text-field>

            <v-autocomplete
              v-model="editing.actors"
              :items="$store.state.actors.items"
              chips
              color="blue-grey lighten-2"
              label="Select"
              item-text="name"
              item-value="id"
              multiple
            >
              <template v-slot:selection="data">
                <v-chip
                  :selected="data.selected"
                  close
                  class="chip--select-multi"
                  @input="removeActor(data.item.id)"
                >
                  <v-avatar>
                    <img :src="data.item.thumbnails[0]">
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
                    <img :src="data.item.avatar">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.item.group"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </template>
            </v-autocomplete>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false" flat>Cancel</v-btn>
          <v-btn @click="saveSettings" outline color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import fs from "fs";
import Vue from "vue";
import path from "path";
import { hash } from "@/util/generator";
import Actor from "@/classes/actor";
import ActorComponent from "@/components/Actor.vue";

export default Vue.extend({
  props: ["value", "video"],
  components: {
    Actor: ActorComponent
  },
  data() {
    return {
      cycle: true,
      editDialog: false,

      editing: {
        title: "",
        actors: [] as string[]
      }
    };
  },
  methods: {
    removeActor(id: string) {
      this.editing.actors = this.editing.actors.filter((a: string) => a != id);
    },
    saveSettings() {
      this.$store.commit("videos/edit", {
        id: this.video.id,
        settings: {
          title: this.editing.title,
          actors: this.editing.actors
        }
      });
      this.editDialog = false;
    },
    openEditDialog() {
      this.editDialog = true;
      this.editing.title = this.video.title;
      this.editing.actors = this.video.actors;
    },
    setCoverIndex(index: number) {
      this.$store.commit("videos/setCoverIndex", {
        id: this.video.id,
        index
      });
    },
    openFileInput() {
      let el = document.querySelector(
        `input[data-id="${this.video.id}"]`
      ) as any;

      el.addEventListener("change", (ev: Event) => {
        let files = Array.from(el.files) as File[];
        let paths = files.map(file => file.path);

        // TODO: only if activated in global settings: copy files to new folder
        if (true) {
          if (!fs.existsSync(path.resolve(process.cwd(), "images/"))) {
            fs.mkdirSync(path.resolve(process.cwd(), "images/"));
          }

          paths = paths.map(p => {
            let imagePath = path.resolve(
              process.cwd(),
              "images/",
              `image-${this.video.id}-${+new Date()}-${hash()}`
            );
            fs.copyFileSync(p, imagePath);
            return imagePath;
          });
        }

        if (files.length)
          this.$store.commit("videos/addThumbnails", {
            id: this.video.id,
            paths: paths
          });

        el.value = "";
      });
      el.click();
    },
    playVideo() {
      this.video.open();
    }
  },
  computed: {
    actors(): Actor[] {
      return this.video.actors.map((id: string) => {
        return this.$store.state.actors.items.find((a: Actor) => a.id == id);
      })
    }
  }
});
</script>

<style lang="scss" scoped>
.thumb-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(0, 0, 0, 0.5);
}

.thumb {
  cursor: pointer;
}
</style>
