<template>
  <div style="padding: 10px 5px 0px 10px">
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "image" : "images" }} found
    </div>
    <list-container>
      <div v-for="image in images" :key="image._id">
        <img
          :src="`/api/media/image/${image._id}/thumbnail?password=xxx`"
          alt=""
          style="width: 100%; height: 300px; object-fit: cover"
        />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import { fetchImages } from "../client/image/fetch";
import { IImage } from "../client/types/image";
/* import ImageCard from "../components/image_card.vue"; */

export default defineComponent({
  components: {
    ListContainer,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Images";

    const images = ref<IImage[]>([]);
    const numItems = ref(-1);
    const numPages = ref(-1);

    useFetch(async () => {
      try {
        const result = await fetchImages(process.server);
        images.value = result.items;
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

    return { images, numItems, numPages };
  },
});
</script>

<style scoped></style>
