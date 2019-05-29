<template>
  <v-container>
    <v-layout row wrap align-center>
      <v-flex xs12 sm8 md6>
        <v-autocomplete
          v-model="chosenActors"
          :items="$store.state.actors.items"
          chips
          label="Select"
          item-text="name"
          item-value="id"
          multiple
          clearable
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

      <v-flex xs6 sm4 md3 lg2 v-for="(image, i) in items" :key="image.id">
        <v-img :src="image.path" v-ripple @click="currentImage = i"></v-img>
      </v-flex>
    </v-layout>

    <transition name="fade">
      <div class="lightbox fill" v-if="currentImage > -1" @click="currentImage = -1">
        <v-btn v-if="currentImage > 0" icon class="thumb-btn left" @click.stop="currentImage--">
          <v-icon color="white">chevron_left</v-icon>
        </v-btn>
        <v-btn
          v-if="currentImage < items.length - 1"
          icon
          class="thumb-btn right"
          @click.stop="currentImage++"
        >
          <v-icon color="white">chevron_right</v-icon>
        </v-btn>
        
        <img class="image" :src="items[currentImage].path">
      </div>
    </transition>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Image from "@/classes/image";
import Actor from "@/classes/actor";

export default Vue.extend({
  data() {
    return {
      currentImage: -1,

      chosenLabels: [] as string[],
      chosenActors: [] as string[]
    };
  },
  methods: {
    removeActor(id: string) {
      this.chosenActors = this.chosenActors.filter(a => a != id);
    }
  },
  computed: {
    labels(): string[] {
      return this.$store.getters["images/getLabels"];
    },
    items() {
      let images = this.$store.state.images.items as Image[];

      if (this.chosenLabels.length) {
        images = images.filter(image =>
          this.chosenLabels.every(label => image.labels.includes(label))
        );
      }

      if (this.chosenActors.length) {
        images = images.filter(image =>
          this.chosenActors.every(actor => image.actors.includes(actor))
        );
      }

      return images;
    }
  }
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.topbar {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
}

.thumb-btn {
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;

  &.left {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  &.right {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
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
    max-width: calc(100vw - 150px);
    max-height: calc(100vh - 20px);
  }
}
</style>
