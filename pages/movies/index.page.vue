<template>
  <div :style="{ padding: '10px' }">
    <div>
      <b>{{ t("foundMovies", numItems) }}</b>
    </div>
    <list-container>
      <div v-for="movie in movies" :key="movie._id">
        <movie-card style="height: 100%" :movie="movie" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import ListContainer from "../../components/list_container.vue";
import MovieCard from "../../components/movie_card.vue";

defineProps(["movies", "numItems", "numPages"]);

const { t } = useI18n();
</script>
