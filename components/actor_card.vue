<template>
  <div
    class="actor card rounded"
    :style="{
      background: `${(actor.thumbnail && actor.thumbnail.color) || 'white'} !important`,
    }"
  >
    <nuxt-link :to="`/actor/${actor._id}`">
      <img
        :src="`/api/media/image/${actor.thumbnail && actor.thumbnail._id}/thumbnail?password=xxx`"
        :alt="actor.name"
        class="thumb hover"
        style="background: #202020"
      />
    </nuxt-link>

    <div
      class="card-body"
      :style="{
        color: actor.thumbnail && actor.thumbnail.color ? 'white' : 'black',
      }"
    >
      <div class="actor-name" :title="actor.name">
        <b>{{ actor.name }}</b>
      </div>

      <div class="rating">{{ (actor.rating / 2).toFixed(1) }}★</div>

      <div v-if="actor.labels.length">
        <label-group :labels="actor.labels"></label-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

import LabelGroup from "./label_group.vue";

export default defineComponent({
  components: { LabelGroup },
  props: {
    actor: {
      type: Object,
    },
  },
});
</script>

<style>
.actor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px !important;
}

.thumb {
  width: 100%;
  height: auto;
}

.card-body {
  text-align: left;
  flex-grow: 1;
  padding: 4px 8px;
}

.actor-name {
  font-size: 16.5px;
  margin-bottom: 6px;

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
