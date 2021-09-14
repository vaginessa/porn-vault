<template>
  <div style="padding: 20px">
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "movie" : "movies" }} found
    </div>
    <list-container>
      <div v-for="movie in movies" :key="movie._id">
        <movie-card style="height: 100%" :movie="movie" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import { fetchMovies } from "../client/movie/fetch";
import { IMovie } from "../client/types/movie";
import MovieCard from "../components/cards/movie.vue";

export default defineComponent({
  components: {
    ListContainer,
    MovieCard,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Movies";

    const movies = ref<IMovie[]>([]);
    const numItems = ref(-1);
    const numPages = ref(-1);

    useFetch(async () => {
      try {
        const result = await fetchMovies(process.server);
        movies.value = result.items;
        numItems.value = result.numItems;
        numPages.value = result.numPages;
      } catch (fetchError) {
        if (!fetchError.response) {
          return error({
            statusCode: 500,
            message: "No response",
          });
        } else {
          return error({
            statusCode: fetchError.response.status,
            message: fetchError.response.data,
          });
        }
      }
    });

    return { movies, numItems, numPages };
  },
});
</script>

<style scoped></style>
