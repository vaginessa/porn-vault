<template>
  <card :thumbnail="scene.thumbnail" :ratio="3 / 4" :to="`/scene/${scene._id}`">
    <template #overlay>
      <div style="flex-grow: 1"></div>
      <div class="overlay-bottom">
        <div style="flex-grow: 1"></div>
        <div class="duration">
          {{ duration }}
        </div>
      </div>
    </template>
    <template #body>
      <div style="margin-bottom: 4px; display: flex; align-items: center">
        <div style="margin-top: 4px" v-if="scene.studio" class="studio-name">
          <nuxt-link :to="`/studio/${scene.studio._id}`">
            <b>{{ scene.studio.name }}</b>
          </nuxt-link>
        </div>
        <div style="flex-grow: 1"></div>
        <div v-if="scene.releaseDate" class="release-date">
          {{ new Date(scene.releaseDate).toLocaleDateString() }}
        </div>
      </div>

      <div class="scene-name" :title="scene.name">
        <b>{{ scene.name }}</b>
      </div>

      <div class="actor-names">
        <span>With </span>
        <span v-for="(actor, i) in scene.actors" :key="actor._id">
          <b>{{ actor.name }}</b
          ><span v-if="i < scene.actors.length - 1">{{
            i === scene.actors.length - 2 ? " & " : ", "
          }}</span>
        </span>
      </div>

      <div class="rating">{{ (scene.rating / 2).toFixed(1) }}★</div>

      <div v-if="scene.labels.length">
        <label-group :labels="scene.labels"></label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent, computed } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import ResponsiveImage from "./image.vue";
import LabelGroup from "./label_group.vue";
import { IScene } from "../client/types/scene";

export default defineComponent({
  components: { Card, LabelGroup, ResponsiveImage },
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
.duration {
  border-radius: 4px;
  background: #000000c0;
  color: white;
  font-weight: bold;
  padding: 2px 4px;
  font-size: 14px;
}

.overlay-bottom {
  display: flex;
  padding: 2px;
}

.studio-name {
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.8;
}

.scene-name {
  font-size: 16.5px;
  margin-bottom: 6px;

  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actor-names {
  font-size: 13.5px;
  margin-bottom: 6px;
}

.rating {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 6px;
}

.release-date {
  font-size: 13.5px;
}
</style>
