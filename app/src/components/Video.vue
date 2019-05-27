<template>
  <div class="pa-2" v-if="video" style="word-break: break-word">
    <v-card v-ripple class="video" @click="$emit('open')">
      <v-img
        v-if="video.thumbnails.length"
        class="thumb"
        :aspect-ratio="1"
        v-ripple
        :src="video.thumbnails[video.coverIndex]"
      ></v-img>
      <v-img v-else class="thumb" :aspect-ratio="1" v-ripple src style="background: grey"></v-img>
    </v-card>
    <div class="mt-3 text-xs-center">
      <span class="subheading">{{ video.title }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import fs from "fs";
import Vue from "vue";
import path from "path";
import { hash } from "@/util/generator";

export default Vue.extend({
  props: ["video"],
  data() {
    return {
      current: null
    };
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
