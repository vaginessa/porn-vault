<template>
  <div class="container">
    <div>
      <h1 class="title">PV {{ version }}</h1>
    </div>
    <div>
      <div v-for="scene in scenes" :key="scene._id">
        <img
          style="height: 225px; object-fit: cover"
          :src="`http://localhost:3000/api/media/image/${scene.thumbnail._id}/thumbnail?password=xxx`"
          :alt="scene.name"
        />
        <div>{{ scene.studio.name }} - {{ scene.name }}</div>
        <div v-for="actor in scene.actors" :key="actor._id">
          <span>
            {{ actor.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

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
* {
  box-sizing: border-box;
}

body {
  margin: 0px;
}

.container {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 24px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
