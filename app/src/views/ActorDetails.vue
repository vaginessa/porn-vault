<template>
  <div>
    <div>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="$router.go(-1)">
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-2">{{actor.name}}</v-toolbar-title>
        <v-btn icon dark @click="favorite">
          <v-icon>{{ actor.favorite ? 'favorite' : 'favorite_border' }}</v-icon>
        </v-btn>
        <v-btn icon dark @click="bookmark">
          <v-icon>{{ actor.bookmark ? 'bookmark' : 'bookmark_border' }}</v-icon>
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
              v-if="actor.thumbnails.length"
              class="clickable elevation-6"
              v-ripple
              :aspect-ratio="1"
              :src="thumbnails[actor.coverIndex]"
              @click="openFileInput"
            ></v-img>
            <v-img
              @click="openFileInput"
              v-else
              class="elevation-6 clickable"
              :aspect-ratio="1"
              src
              style="background: grey"
            ></v-img>
            <input accept="image/*" multiple style="display:none" type="file" :data-id="actor.id">
          </v-flex>
          <v-flex xs6 sm8 md9 lg10>
            <v-container fluid fill-height>
              <div class="fill">
                <div>
                  <span v-for="i in 5" :key="i">
                    <v-icon @click="rateActor(i)" v-if="i > actor.rating">star_border</v-icon>
                    <v-icon color="amber" @click="rateActor(i)" v-else>star</v-icon>
                  </span>
                </div>

                <div class="mt-4">
                  <v-icon class="mr-1" style="vertical-align: bottom">label</v-icon>
                  <span class="subheading">Labels</span>
                </div>
                <div class="mt-1">
                  <v-chip
                    small
                    v-for="label in actor.labels.slice().sort()"
                    :key="label"
                  >{{ label }}</v-chip>
                  <v-chip small @click color="primary white--text">+ Add</v-chip>
                </div>
              </div>
            </v-container>
          </v-flex>

          <v-flex class="py-5" xs12 v-if="videos.length">
            <p class="text-xs-center title font-weight-regular">Scenes</p>
            <v-layout row wrap>
              <v-flex v-for="video in videos" :key="video.id" xs6 sm4 md4 lg3>
                <Video :video="video"></Video>
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
            v-if="actor.thumbnails.length > 1"
          >
            <p class="text-xs-center title font-weight-regular">Images</p>
            <v-checkbox v-model="cycle" label="Auto-cycle images"></v-checkbox>
            <v-carousel :cycle="cycle">
              <v-carousel-item v-for="(item,i) in thumbnails" :key="i" :src="item">
                <v-btn @click="setCoverIndex(i)" icon class="thumb-btn" large>
                  <v-icon>photo</v-icon>
                </v-btn>
              </v-carousel-item>
            </v-carousel>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import fs from "fs";
import Vue from "vue";
import path from "path";
import Actor from "@/classes/actor";
import Video from "@/classes/video";
import Image from "@/classes/image";
import { hash } from "@/util/generator";
import VideoComponent from "@/components/Video.vue";

export default Vue.extend({
  components: {
    Video: VideoComponent
  },
  data() {
    return {
      editDialog: false,
      cycle: true,

      editing: {
        name: ""
      }
    };
  },
  methods: {
    openEditDialog() {
      this.editDialog = true;
      this.editing.name = this.actor.name;
    },
    favorite() {
      this.$store.commit("actors/favorite", this.actor.id);
    },
    bookmark() {
      this.$store.commit("actors/bookmark", this.actor.id);
    },
    rateActor(rating: number) {
      this.$store.commit("actors/rate", {
        id: this.actor.id,
        rating
      });
    },
    setCoverIndex(index: number) {
      this.$store.commit("actors/setCoverIndex", {
        id: this.actor.id,
        index
      });
    },
    openFileInput() {
      let el = document.querySelector(
        `input[data-id="${this.actor.id}"]`
      ) as any;

      el.addEventListener("change", (ev: Event) => {
        let fileArray = Array.from(el.files) as File[];
        let files = fileArray.map(file => {
          return {
            name: file.name,
            path: file.path,
            size: file.size
          };
        }) as { name: string; path: string; size: number }[];

        if (this.$store.state.globals.settings.copyThumbnails) {
          if (!fs.existsSync(path.resolve(process.cwd(), "library/images/"))) {
            fs.mkdirSync(path.resolve(process.cwd(), "library/images/"));
          }

          files.forEach(file => {
            let p = file.path;
            let imagePath = path.resolve(
              process.cwd(),
              "library/images/",
              `image-${this.actor.id}-${hash()}`
            );
            fs.copyFileSync(p, imagePath);
            file.path = imagePath;
          });
        }

        let images = files.map(file => Image.create(file));

        images.forEach(image => {
          image.actors.push(this.actor.id);
          image.labels.push(...this.actor.labels);
        });

        this.$store.commit("images/add", images);

        if (files.length)
          this.$store.commit("actors/addThumbnails", {
            id: this.actor.id,
            images: images.map(i => i.id)
          });

        el.value = "";
      });
      el.click();
    }
  },
  computed: {
    actor(): Actor {
      return this.$store.state.actors.items.find(
        (v: Actor) => v.id == this.$route.params.id
      );
    },
    videos(): Video[] {
      return this.$store.getters["videos/getByActor"](this.actor.id);
    },
    thumbnails() : string[] {
      return (<Actor>this.actor).thumbnails.map(id => this.$store.getters["images/idToPath"](id));
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

.clickable {
  &:hover {
    cursor: pointer;
  }
}
</style>
