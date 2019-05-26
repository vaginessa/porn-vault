<template>
  <div class="pa-2" v-if="video">
    <v-card v-ripple class="video" @click="openVideo">
      <v-img v-if="video.thumbnail" class="thumb" :aspect-ratio="1" v-ripple :src="video.thumbnail"></v-img>
      <v-img v-else class="thumb" :aspect-ratio="1" v-ripple src="" style="background: grey"></v-img>
      <v-icon color="white" class="play-btn center">play_arrow</v-icon>
    </v-card>
    <div class="mt-3 text-xs-center font-weight-regular">
      <span class="title">{{ video.title }}</span>
    </div>
  </div>
</template>

<script>
const { shell } = require("electron");

export default {
  props: ["video"],
  methods: {
    openVideo() {
      shell.openItem(this.video.path);
    }
  }
};
</script>

<style lang="scss" scoped>
.video {
  user-select: none;  

  &:hover {
    .thumb {
      cursor: pointer;
      filter: brightness(0.75);
    }

    .play-btn {
      opacity: 1 !important;
    }
  }

  .thumb {
    transition: filter 0.15s ease-in-out;
  }

  .play-btn {
    opacity: 0;
    font-size: 96px;
    z-index: 999;
    cursor: pointer;
  }
}
</style>
