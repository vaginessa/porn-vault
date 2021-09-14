<template>
  <card :color="actor.thumbnail && actor.thumbnail.color">
    <template #image>
      <nuxt-link :to="`/actor/${actor._id}`">
        <responsive-image
          :ratio="4 / 3"
          :src="`/api/media/image/${actor.thumbnail && actor.thumbnail._id}/thumbnail?password=xxx`"
          class="thumbnail hover"
          style="background: #303030"
          :alt="`${actor.name} thumbnail`"
        >
          <slot name="overlay" />
        </responsive-image>
      </nuxt-link>
    </template>
    <template #body>
      <div style="margin-bottom: 4px; display: flex; align-items: center">
        <div class="flex" style="margin-right: 5px" v-if="actor.nationality">
          <flag
            :name="`${actor.nationality.name} (${actor.nationality.nationality})`"
            :width="22"
            :value="actor.nationality.alpha2"
          />
        </div>
        <div class="actor-name" :title="actor.name">
          <b>{{ actor.name }}</b>
        </div>
        <div style="flex-grow: 1"></div>
        <div v-if="actor.age" class="age">
          {{ actor.age }}
        </div>
      </div>

      <div class="rating">
        <Rating :value="actor.rating" color="black" />
      </div>

      <div v-if="actor.labels.length">
        <label-group :limit="5" :labels="actor.labels"></label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import LabelGroup from "../label_group.vue";
import Rating from "../rating.vue";
import ResponsiveImage from "../image.vue";

export default defineComponent({
  components: { Card, LabelGroup, Rating, ResponsiveImage },
  props: {
    actor: {
      type: Object,
    },
  },
});
</script>

<style>
.overlay-bottom {
  display: flex;
  align-items: center;
  padding: 2px;
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

.age {
  font-weight: bold;
}

.actor-name {
  font-size: 16.5px;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 6px;
}
</style>
