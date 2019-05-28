<template>
  <v-container>
    <v-layout row wrap align-center>
      <v-flex xs6 sm4 md3 lg2 v-for="(image, i) in items" :key="image.id">
        <v-img :src="image.path" v-ripple @click="currentImage = i"></v-img>
      </v-flex>
    </v-layout>

    <div class="lightbox fill" v-if="currentImage > -1">
      <v-btn v-if="currentImage > 0" icon class="thumb-btn left" @click="currentImage--">
        <v-icon color="white">chevron_left</v-icon>
      </v-btn>
      <v-btn v-if="currentImage < items.length - 1" icon class="thumb-btn right" @click="currentImage++">
        <v-icon color="white">chevron_right</v-icon>
      </v-btn>

      <div class="topbar">
        <v-spacer></v-spacer>
        <v-btn icon class="thumb-btn" @click="currentImage = -1">
          <v-icon color="white">close</v-icon>
        </v-btn>
      </div>
      <img class="image" :src="items[currentImage].path">
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      currentImage: -1
    };
  },
  computed: {
    items() {
      return this.$store.state.images.items;
    }
  }
};
</script>

<style lang="scss" scoped>
.topbar {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
}

.thumb-btn {
  background: rgba(0, 0, 0, 0.5);

  &.left {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
  }

  &.right {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
  }
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);

  .image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
