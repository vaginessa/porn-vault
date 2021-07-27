<template>
  <div style="padding: 10px 5px 0px 10px">
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "studio" : "studios" }} found
    </div>
    <list-container>
      <div v-for="studio in studios" :key="studio._id">
        <div style="padding: 5px; background: grey">
          <img
            :src="`/api/media/image/${
              studio.thumbnail && studio.thumbnail._id
            }/thumbnail?password=xxx`"
            alt=""
            style="width: 100%; height: 75px; object-fit: contain"
          />
        </div>
        <!--  <studio-card style="height: 100%" :studio="studio" /> -->
        {{ studio }}
      </div>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import { fetchStudios } from "../client/studio/fetch";
import { IStudio } from "../client/types/studio";
/* import StudioCard from "../components/studio_card.vue"; */

export default defineComponent({
  components: {
    ListContainer,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Studios";

    const studios = ref<IStudio[]>([]);
    const numItems = ref(-1);
    const numPages = ref(-1);

    useFetch(async () => {
      try {
        const result = await fetchStudios(process.server);
        studios.value = result.items;
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

    return { studios, numItems, numPages };
  },
});
</script>

<style scoped></style>
