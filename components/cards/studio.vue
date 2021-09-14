<template>
  <card :color="studio.thumbnail && studio.thumbnail.color">
    <template #image>
      <nuxt-link :to="`/studio/${studio._id}`">
        <responsive-image
          :ratio="1 / 2"
          :src="`/api/media/image/${
            studio.thumbnail && studio.thumbnail._id
          }/thumbnail?password=xxx`"
          class="thumbnail hover"
          style="background: #303030"
          objectFit="contain"
          :padding="10"
          :alt="`${studio.name} thumbnail`"
        >
          <slot name="overlay" />
        </responsive-image>
      </nuxt-link>
    </template>
    <template #body>
      <div v-if="studio.parent" style="margin-bottom: 4px; display: flex; align-items: center">
        <div class="parent-name hover inverted">
          <nuxt-link :to="`/studio/${studio.parent._id}`">
            <b>{{ studio.parent.name }}</b>
          </nuxt-link>
        </div>
      </div>

      <div class="studio-name" :title="studio.name">
        <b>{{ studio.name }}</b>
      </div>

      <div class="scene-count">
        {{ studio.numScenes }} {{ studio.numScenes === 1 ? "scene" : "scenes" }}
      </div>

      <div v-if="studio.labels.length">
        <label-group :limit="5" :labels="studio.labels"></label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import LabelGroup from "../label_group.vue";
import ResponsiveImage from "../image.vue";

export default defineComponent({
  components: { Card, LabelGroup, ResponsiveImage },
  props: {
    studio: {
      type: Object,
    },
  },
});
</script>

<style scoped>
.parent-name {
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 0.4px;
}

.studio-name {
  font-size: 16.5px;
  margin-bottom: 4px;

  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scene-count {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}
</style>
