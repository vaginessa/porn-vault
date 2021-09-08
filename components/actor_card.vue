<template>
  <card :thumbnail="actor.thumbnail" :ratio="4 / 3" :to="`/actor/${actor._id}`">
    <template #overlay>
      <div style="flex-grow: 1"></div>
      <div class="overlay-bottom">
        <div class="round-button hover" style="margin-right: 4px">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; stroke-width: 2px"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="{2}"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <div class="round-button hover">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; stroke-width: 2px"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
      </div>
    </template>
    <template #body>
      <div style="margin-bottom: 4px; display: flex; align-items: center">
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
import LabelGroup from "./label_group.vue";
import Rating from "../components/rating.vue";

export default defineComponent({
  components: { Card, LabelGroup, Rating },
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
