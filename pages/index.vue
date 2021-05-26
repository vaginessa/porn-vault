<template>
  <div>
    <list-container>
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene"></scene-card>
      </div>
    </list-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useFetch, useContext, useMeta } from "@nuxtjs/composition-api";
import axios from "axios";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/scene_card.vue";
import { getUrl } from "../client/util/url";

async function fetchScenes() {
  const { data } = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($query: SceneSearchQuery!, $seed: String) {
          getScenes(query: $query, seed: $seed) {
            items {
              _id
              name
              releaseDate
              rating
              thumbnail {
                _id
                color
              }
              labels {
                _id
                name
                color
              }
              actors {
                _id
                name
              }
              studio {
                name
              }
            }
            numItems
            numPages
          }
        }
      `,
      variables: {
        query: {
          query: "",
          page: 0,
          sortBy: "addedOn",
          sortDir: "desc",
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return data.data.getScenes.items;
}

/* async function fetchVersion() {
  const res = await axios.get(getUrl("/api/version", process.server));
  return res.data.result;
} */

export default defineComponent({
  components: {
    SceneCard,
    ListContainer,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const { title } = useMeta();

    title.value = "Home";

    const scenes = ref([]);

    useFetch(async () => {
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
    });

    return { scenes };
  },
});
</script>

<style scoped></style>
