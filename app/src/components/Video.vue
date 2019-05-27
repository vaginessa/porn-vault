<template>
  <div class="pa-2" v-if="video">
    <v-card v-ripple class="video" @click="expand">
      <v-img
        v-if="video.thumbnails.length"
        class="thumb"
        :aspect-ratio="1"
        v-ripple
        :src="video.thumbnails[video.coverIndex]"
      ></v-img>
      <v-img v-else class="thumb" :aspect-ratio="1" v-ripple src style="background: grey"></v-img>
    </v-card>
    <div class="mt-3 text-xs-center font-weight-regular">
      <span class="title">{{ video.title }}</span>
    </div>

    <v-dialog v-model="expanded" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="expanded = false">
            <v-icon>chevron_left</v-icon>
          </v-btn>
          <v-toolbar-title>{{video.title}}</v-toolbar-title>
          <v-btn icon dark @click="openEditDialog">
            <v-icon>edit</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-layout row wrap>
            <v-flex xs6 sm4 md3 lg2>
              <v-img
                v-if="video.thumbnails.length"
                class
                :aspect-ratio="1"
                :src="video.thumbnails[video.coverIndex]"
                @click="openFileInput"
              ></v-img>
              <v-img
                @click="openFileInput"
                v-else
                class="thumb"
                :aspect-ratio="1"
                src
                style="background: grey"
              ></v-img>
              <input multiple style="display:none" type="file" :data-id="video.id">
            </v-flex>
            <v-flex xs6 sm8 md9 lg10>
              <v-container fill-height>
                <div class="fill" style="background:grey">Info area</div>
              </v-container>
            </v-flex>
            <v-flex
              class="mt-5"
              xs12
              sm10
              offset-sm1
              md8
              offset-md2
              lg6
              offset-lg3
              v-if="video.thumbnails.length > 1"
            >
              <div class="text-xs-center">Images</div>
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
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false" flat>Cancel</v-btn>
          <v-btn outline color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script <script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["video"],
  data() {
    return {
      expanded: false,
      cycle: true,
      editDialog: false,

      editing: {
        title: ""
      }
    };
  },
  methods: {
    openEditDialog() {
      this.editDialog = true;
      this.editing.title = this.video.title;
    },
    setCoverIndex(index) {
      this.$store.commit("videos/setCoverIndex", {
        id: this.video.id,
        index
      });
    },
    openFileInput() {
      let el = document.querySelector(
        `input[data-id="${this.video.id}"]`
      ) as any;

      el.addEventListener("change", ev => {
        let files = Array.from(el.files) as File[];
        if (files.length)
          this.$store.commit("videos/addThumbnails", {
            id: this.video.id,
            paths: files.map(f => f.path)
          });
      });
      el.click();
    },
    open() {
      this.video.open();
    },
    expand() {
      this.expanded = true;
    }
  },
  mounted() {
    // let el = document.getElementById(this.domId);
    // el.ondragenter = ev => {
    //   this.dragOver = true;
    //   ev.preventDefault();
    // };
    // el.ondragleave = ev => {
    //   this.dragOver = false;
    //   ev.preventDefault();
    // };
    // el.ondrop = ev => {
    //   ev.preventDefault();
    //   let droppedFiles = ev.dataTransfer.files;
    //   this.dragOver = false;
    //   //this.$store.dispatch("videos/add", Array.from(droppedFiles));
    //   console.log(Array.from(droppedFiles));
    // };
  }
});
</script>

<style lang="scss" scoped>
.video {
  user-select: none;

  &:hover {
    .thumb {
      cursor: pointer;
      filter: brightness(0.8);
    }
  }

  .thumb {
    transition: filter 0.15s ease-in-out;
  }
}

.thumb-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(0, 0, 0, 0.5);
}
</style>
