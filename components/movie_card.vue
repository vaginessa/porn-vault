<template>
  <card :thumbnail="movie.frontCover" :ratio="1.4" :to="`/movie/${movie._id}`">
    <template #overlay>
      <div style="flex-grow: 1"></div>
      <div class="overlay-bottom">
        <div class="round-button" style="margin-right: 4px">
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
        <div class="round-button">
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
        <div v-if="movie.studio" class="studio-name">
          <nuxt-link :to="`/studio/${movie.studio._id}`">
            <b>{{ movie.studio.name }}</b>
          </nuxt-link>
        </div>
        <div style="flex-grow: 1"></div>
        <div v-if="movie.releaseDate" class="release-date">
          {{ new Date(movie.releaseDate).toLocaleDateString() }}
        </div>
      </div>

      <div class="movie-name" :title="movie.name">
        <b>{{ movie.name }}</b>
      </div>

      <div class="rating">{{ (movie.rating / 2).toFixed(1) }}★</div>

      <div v-if="movie.labels.length">
        <label-group :labels="movie.labels"></label-group>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent, computed } from "@nuxtjs/composition-api";

import Card from "./card.vue";
import LabelGroup from "./label_group.vue";

export default defineComponent({
  components: { Card, LabelGroup },
  props: {
    movie: {
      type: Object,
    },
  },
  setup(props) {
    const duration = computed(() => {
      const movie = props.movie as any; // TODO: type
      const H = Math.floor(movie.duration / 3600);
      const mm = Math.floor(movie.duration / 60 - H * 60)
        .toString()
        .padStart(2, "0");
      const ss = Math.floor(movie.duration % 60)
        .toString()
        .padStart(2, "0");
      if (H) {
        return `${H}:${mm}:${ss}`;
      }
      return `${mm}:${ss}`;
    });

    return { duration };
  },
});
</script>

<style>
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
}

.release-date {
  font-size: 13.5px;
}

.movie-name {
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
