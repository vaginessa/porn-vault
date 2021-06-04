<template>
  <card :thumbnail="actor.thumbnail" :ratio="4 / 3" :to="`/actor/${actor._id}`">
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

      <div class="rating">{{ (actor.rating / 2).toFixed(1) }}★</div>

      <div v-if="actor.labels.length">
        <label-group :labels="actor.labels"></label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import LabelGroup from "./label_group.vue";

export default defineComponent({
  components: { Card, LabelGroup },
  props: {
    actor: {
      type: Object,
    },
  },
});
</script>

<style>
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
