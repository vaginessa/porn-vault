<template>
  <div :style="{ padding: '10px' }">
    <!-- Actors -->
     <div style="margin-bottom: 20px">
      <div @click="showActors = !showActors" class="category-header" style="margin-bottom: 5px">
        <b>{{ t("foundActors", actorResult.numItems) }}</b>
      </div>
      <div v-if="showActors">
        <list-container min="150px" max="1fr">
          <div
            style="display: flex; flex-direction: column"
            v-for="actor in actorResult.items"
            :key="actor._id"
          >
            <div
              style="
                display: flex;
                align-items: center;
                flex-grow: 1;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px !important;
              "
              class="card rounded hover"
            >
              <a :to="`/actor/${actor._id}`">
                <img
                  style="display: block; width: 100%; height: auto"
                  :src="`/api/media/image/${actor.thumbnail && actor.thumbnail._id}/thumbnail`"
                />
              </a>
            </div>
            <div style="font-size: 16px; margin-top: 10px; text-align: center">
              <b>{{ actor.name }}</b>
            </div>
          </div>
        </list-container>
      </div>
    </div>
    <!-- Actors end -->

    <!-- Scenes -->
    <div style="margin-bottom: 20px">
      <div @click="showScenes = !showScenes" class="category-header" style="margin-bottom: 5px">
        <b>{{ t("foundScenes", sceneResult.numItems) }}</b>
      </div>
      <div v-if="showScenes">
        <list-container>
          <div v-for="scene in sceneResult.items" :key="scene._id">
            <scene-card style="height: 100%" :scene="scene"></scene-card>
          </div>
        </list-container>
      </div>
    </div>
    <!-- Scenes end -->

    <!-- Movies -->
    <div>
      <div @click="showMovies = !showMovies" class="category-header">
        <b>{{ t("foundMovies", movieResult.numItems) }}</b>
      </div>
      <div v-if="showMovies">
        <list-container>
          <div v-for="movie in movieResult.items" :key="movie._id">
            <movie-card style="height: 100%" :movie="movie"></movie-card>
          </div>
        </list-container>
      </div>
    </div>
    <!-- Movies end -->
  </div>
</template>

<script lang="ts" setup>
import {
  defineComponent,
  useRoute,
  ref,
  useFetch,
  useContext,
  useMeta,
  onMounted,
} from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";

import ListContainer from "../../components/list_container.vue";
import MovieCard from "../../components/movie_card.vue";
import SceneCard from "../../components/scene_card.vue";

defineProps(["sceneResult", "actorResult", "movieResult"]);

const showActors = ref(true);
const showScenes = ref(true);
const showMovies = ref(true);

const { t } = useI18n();
</script>

<style scoped>
pre {
  margin-bottom: 0;
}

.category-header {
  font-size: 18px;
}
</style>

