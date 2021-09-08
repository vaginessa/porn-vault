<template>
  <card :thumbnail="scene.thumbnail" :ratio="3 / 4" :to="`/scene/${scene._id}`">
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
        <div style="flex-grow: 1"></div>
        <div class="duration">
          {{ duration }}
        </div>
      </div>
    </template>
    <template #body>
      <div style="margin-bottom: 4px; display: flex; align-items: center">
        <div v-if="scene.studio" class="studio-name inverted-hover">
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
            <b class="inverted-hover">{{ actor.name }}</b> </nuxt-link
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
              <div style="width: 110px">FILE SIZE</div>
              <div style="font-weight: bold">
                {{ (scene.meta.size / 1000 / 1000 / 1000).toFixed(1) }} GB
              </div>
            </div>
            <div
              style="display: flex; margin-bottom: 5px; font-size: 14px"
              v-if="scene.meta.dimensions"
            >
              <div style="width: 110px">DIMENSIONS</div>
              <div style="font-weight: bold">
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
                <div style="width: 110px">
                  {{ scene.availableFields.find((field) => field._id === key).name }}
                </div>
                <div style="font-weight: bold">
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
import ResponsiveImage from "./image.vue";
import LabelGroup from "./label_group.vue";
import { IScene } from "../client/types/scene";
import Rating from "../components/rating.vue";

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
