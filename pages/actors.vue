<template>
  <div>
    <list-container>
      {{ actors }}
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";
import axios from "axios";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/scene_card.vue";
import { getUrl } from "../client/util/url";

export default defineComponent({
  components: {
    ListContainer,
  },
  head: {},
  setup() {
    // const { error } = useContext();
    const { title } = useMeta();

    title.value = "Actors";

    const actors = ref([]);

    /* useFetch(async () => {
      try {
        scenes.value = await fetchScenes();
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
    }); */

    return { actors };
  },
});
</script>

<style scoped></style>
