<template>
  <div class="container">
    <div class="list-container">
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene"></scene-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import SceneCard from "../components/scene_card.vue";

async function fetchScenes() {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
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
  },
  async asyncData({ error }) {
    try {
      const url = process.server ? "http://localhost:3000/api/version" : "/api/version";
      const res = await axios.get(url);

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

.list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  grid-gap: 0.5em 0.5em;
}
</style>
