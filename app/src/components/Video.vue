<template>
  <div class="pa-2" v-if="video">
    <v-card v-ripple class="video" @click="expand">
      <v-img
        v-if="video.thumbnails.length"
        class="thumb"
        :aspect-ratio="1"
        v-ripple
        :src="video.thumbnails[0]"
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
        </v-toolbar>
        <v-container>
          <v-layout>
            <v-flex xs6 sm4 md3 lg2>
              <v-img
                v-if="video.thumbnails.length"
                class
                :aspect-ratio="1"
                :src="video.thumbnails[0]"
              ></v-img>
              <v-img v-else class="thumb" :aspect-ratio="1" src style="background: grey"></v-img>
            </v-flex>
            <v-flex xs6 sm8 md9 lg10>
              <v-container fill-height>
                <div class="fill" style="background:grey">
                  Info area
                </div>
              </v-container>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["video"],
  data() {
    return {
      expanded: false
    };
  },
  methods: {
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
};
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
</style>
