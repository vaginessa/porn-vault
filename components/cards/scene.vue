<template>
  <card class="scene-card" :color="scene.thumbnail && scene.thumbnail.color">
    <template #image>
      <nuxt-link :to="`/scene/${scene._id}`">
        <responsive-image
          :ratio="3 / 4"
          :src="`/api/media/image/${scene.thumbnail && scene.thumbnail._id}/thumbnail?password=xxx`"
          class="thumbnail hover"
          style="background: #303030"
          :alt="`${scene.name} thumbnail`"
        >
          <slot name="overlay" />
        </responsive-image>
      </nuxt-link>
    </template>
    <template #body>
      <div style="margin-bottom: 4px; display: flex; align-items: center">
        <div v-if="scene.studio" class="studio-name hover inverted">
          <nuxt-link :to="`/studio/${scene.studio._id}`">
            <b>{{ scene.studio.name }}</b>
          </nuxt-link>
        </div>
        <div style="flex-grow: 1"></div>
        <div v-if="scene.releaseDate" class="release-date">
          <b>{{ new Date(scene.releaseDate).toLocaleDateString() }}</b>
        </div>
      </div>

      <div class="scene-name" :title="scene.name">
        <b>{{ scene.name }}</b>
      </div>

      <hr />

      <div class="actor-names" v-if="scene.actors.length">
        <span>With </span>
        <span v-for="(actor, i) in scene.actors" :key="actor._id">
          <nuxt-link :to="`/actor/${actor._id}`">
            <b class="hover inverted">{{ actor.name }}</b> </nuxt-link
          ><span v-if="i < scene.actors.length - 1">{{
            i === scene.actors.length - 2 ? " & " : ", "
          }}</span>
        </span>
      </div>

      <div class="rating">
        <Rating :value="scene.rating" color="black" />
      </div>

      <div v-if="scene.labels.length">
        <label-group :limit="5" :labels="scene.labels">
          <template v-slot:extra>
            <!-- TODO: add some good styling to this section -->
            <hr />
            <div style="display: flex; margin-bottom: 5px; font-size: 14px" v-if="scene.meta.size">
              <div class="info-row-left">File size</div>
              <div class="info-row-right">
                {{ (scene.meta.size / 1000 / 1000 / 1000).toFixed(1) }} GB
              </div>
            </div>
            <div
              style="display: flex; margin-bottom: 5px; font-size: 14px"
              v-if="scene.meta.dimensions"
            >
              <div class="info-row-left">Dimensions</div>
              <div class="info-row-right">
                {{ scene.meta.dimensions.width }}x{{ scene.meta.dimensions.height }}px
              </div>
            </div>
            <hr />
            <div>
              <div
                style="display: flex; margin-bottom: 5px; font-size: 14px"
                v-for="(value, key) in scene.customFields"
                :key="key"
              >
                <div class="info-row-left">
                  {{ scene.availableFields.find((field) => field._id === key).name }}
                </div>
                <div class="info-row-right">
                  {{ value }}
                </div>
              </div>
            </div>
            <!-- <div>
              {{ scene.customFields }}
            </div>
            <div>
              {{ scene.availableFields }}
            </div> -->
          </template>
        </label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent, computed } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import ResponsiveImage from "../image.vue";
import LabelGroup from "../label_group.vue";
import { IScene } from "../../client/types/scene";
import Rating from "../../components/rating.vue";

export default defineComponent({
  components: { Card, LabelGroup, ResponsiveImage, Rating },
  props: {
    scene: {
      type: Object,
    },
  },
  setup(props) {
    const duration = computed(() => {
      const scene = props.scene as IScene;
      const H = Math.floor(scene.meta.duration / 3600);
      const mm = Math.floor(scene.meta.duration / 60 - H * 60)
        .toString()
        .padStart(2, "0");
      const ss = Math.floor(scene.meta.duration % 60)
        .toString()
        .padStart(2, "0");
      if (H) {
        return `${H}:${mm}:${ss}`;
      }
      return `${mm}:${ss}`;
    });

    return {
      duration,
    };
  },
});
</script>

<style scoped>
.dark .scene-card div {
  color: white;
}

.info-row-left {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100px;
}

.info-row-right {
  font-weight: bold;
}

.round-button {
  border-radius: 50%;
  padding: 4px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.duration {
  border-radius: 4px;
  background: #000000c0;
  color: white;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
}

.overlay-bottom {
  display: flex;
  align-items: center;
  padding: 2px;
}

.studio-name {
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 0.4px;
}

.scene-name {
  font-size: 16.5px;
  margin-bottom: 4px;

  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actor-names {
  font-size: 14px;
  margin-bottom: 6px;
  line-height: 20px;
}

.rating {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 6px;
}

.release-date {
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 0.4px;
}
</style>
