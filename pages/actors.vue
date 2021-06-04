<template>
  <div>
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "actor" : "actors" }} found
    </div>
    <list-container min="200px">
      <client-only>
        <div v-for="actor in actors" :key="actor._id">
          <actor-card style="height: 100%" :actor="actor" />
        </div>
      </client-only>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";

import ListContainer from "../components/list_container.vue";
import { fetchActors } from "../client/actor/fetch";
import { IActor } from "../client/types/actor";
import ActorCard from "../components/actor_card.vue";

export default defineComponent({
  components: {
    ActorCard,
    ListContainer,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Actors";

    const actors = ref<IActor[]>([]);
    const numItems = ref(-1);
    const numPages = ref(-1);

    useFetch(async () => {
      try {
        const result = await fetchActors(process.server);
        actors.value = result.items;
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

    return { actors, numItems, numPages };
  },
});
</script>

<style scoped></style>
