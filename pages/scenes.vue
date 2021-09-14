<template>
  <div style="padding: 20px">
    <div v-if="sceneLoadError">
      <div>{{ sceneLoadError }}</div>
      <button @click="loadCurrentPage">Reload</button>
    </div>
    <div v-else-if="loading">Loading...</div>
    <div v-else>
      <div class="flex align-center" style="margin-bottom: 10px">
        <div>
          <b>{{ numItems }}</b> {{ numItems === 1 ? "scene" : "scenes" }} found
        </div>
        <div style="flex-grow: 1"></div>
        <button :disabled="!canDecrementPage" @click="decrementPage">-</button>
        <h3 style="margin: 0px 10px">{{ currentPage + 1 }}/{{ numPages }}</h3>
        <button :disabled="!canIncrementPage" @click="incrementPage">+</button>
      </div>
      <div></div>
      <list-container>
        <div v-for="scene in scenes" :key="scene._id">
          <scene-card style="height: 100%" :scene="scene" />
        </div>
      </list-container>
      <div class="flex align-center content-center" style="margin-top: 20px">
        <button :disabled="!canDecrementPage" @click="decrementPage">-</button>
        <h3 style="margin: 0px 10px">{{ currentPage + 1 }}/{{ numPages }}</h3>
        <button :disabled="!canIncrementPage" @click="incrementPage">+</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useContext,
  useMeta,
  useFetch,
  ref,
  computed,
} from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/cards/scene.vue";
import { useSceneList } from "../client/scene/fetch";

export default defineComponent({
  components: {
    SceneCard,
    ListContainer,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Scenes";

    const {
      scenes,
      fetchScenes,
      loading,
      error: sceneLoadError,
      numItems,
      numPages,
    } = useSceneList();

    const currentPage = ref(0);
    const canIncrementPage = computed(() => currentPage.value < numPages.value - 1);
    const canDecrementPage = computed(() => currentPage.value > 0);

    async function loadCurrentPage() {
      await fetchScenes(currentPage.value, process.server);
    }

    async function incrementPage() {
      if (canIncrementPage.value) {
        currentPage.value++;
        await loadCurrentPage();
      }
    }

    async function decrementPage() {
      if (canDecrementPage.value) {
        currentPage.value--;
        await loadCurrentPage();
      }
    }

    useFetch(async () => {
      await loadCurrentPage();
      if (sceneLoadError.value) {
        return error({
          statusCode: 500,
          message: sceneLoadError.value,
        });
      }
    });

    return {
      loadCurrentPage,
      currentPage,
      incrementPage,
      decrementPage,
      canIncrementPage,
      canDecrementPage,

      scenes,
      numItems,
      numPages,
      loading,
      sceneLoadError,
    };
  },
});
</script>

<style scoped></style>
