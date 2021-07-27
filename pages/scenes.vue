<template>
  <div style="padding: 10px 5px 0px 10px">
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "scene" : "scenes" }} found
    </div>
    <list-container>
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, useMeta, useFetch } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/scene_card.vue";
import { fetchScenes } from "../client/scene/fetch";
import { IScene } from "../client/types/scene";

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

    const scenes = ref<IScene[]>([]);
    const numItems = ref(-1);
    const numPages = ref(-1);

    useFetch(async () => {
      try {
        const result = await fetchScenes(process.server);
        scenes.value = result.items;
        numItems.value = result.numItems;
        numPages.value = result.numPages;
      } catch (fetchError) {
        if (!fetchError.response) {
          console.error(fetchError);
          return error({
            statusCode: 500,
            message: "Internal error - check console",
          });
        } else {
          return error({
            statusCode: fetchError.response.status,
            message: fetchError.response.data,
          });
        }
      }
    });

    return { scenes, numItems, numPages };
  },
});
</script>

<style scoped></style>
