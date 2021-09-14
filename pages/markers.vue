<template>
  <div style="padding: 20px">
    <list-container>
      {{ actors }}
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";

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
