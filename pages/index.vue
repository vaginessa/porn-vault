<template>
  <div class="container">
    <list-container>
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene"></scene-card>
      </div>
    </list-container>
  </div>
</template>

<script>
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

export default {
  components: {
    SceneCard,
    ListContainer,
  },
  head() {
    return {
      title: "Home",
    };
  },
  async asyncData({ error }) {
    try {
      const res = await axios.get(getUrl("/api/version", process.server));

      const scenes = await fetchScenes();

      return {
        version: res.data.result,
        scenes,
      };
    } catch (fetchError) {
      if (!fetchError.response) {
        error({
          statusCode: 500,
          message: "No response",
        });
      } else {
        error({
          statusCode: fetchError.response.status,
          message: fetchError.response.data,
        });
      }
    }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}
</style>
