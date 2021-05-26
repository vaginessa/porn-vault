<template>
  <div>
    <div>
      <div class="category-header" style="margin-bottom: 5px">
        <pre><b>{{ sceneResult.numItems }}</b> scenes found</pre>
      </div>
      <div>
        <list-container>
          <div v-for="scene in sceneResult.items" :key="scene._id">
            <scene-card style="height: 100%" :scene="scene"></scene-card>
          </div>
        </list-container>
      </div>
    </div>
    <div>
      <div class="category-header" style="margin-bottom: 5px">
        <pre><b>{{ actorResult.numItems }}</b> actors found</pre>
      </div>
      <div>
        <list-container min="150px" max="1fr">
          <div
            style="display: flex; flex-direction: column"
            v-for="actor in actorResult.items"
            :key="actor._id"
          >
            <div
              style="
                display: flex;
                align-items: center;
                flex-grow: 1;
                overflow: hidden;
                box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px !important;
              "
              class="card rounded hover"
            >
              <nuxt-link :to="`/actor/${actor._id}`">
                <img
                  style="display: block; width: 100%; height: auto"
                  :src="`/api/media/image/${actor.thumbnail && actor.thumbnail._id}/thumbnail`"
                />
              </nuxt-link>
            </div>
            <div style="font-size: 16px; margin-top: 10px; text-align: center">
              <b>{{ actor.name }}</b>
            </div>
          </div>
        </list-container>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/scene_card.vue";
import { getUrl } from "../client/util/url";

async function searchAll(query) {
  const { data } = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!) {
          getScenes(query: $sc) {
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
          }
          getActors(query: $ac) {
            items {
              _id
              name
              thumbnail {
                _id
                color
              }
            }
            numItems
          }
        }
      `,
      variables: {
        sc: {
          query,
          take: 8,
        },
        ac: {
          query,
          take: 8,
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    sceneResult: data.data.getScenes,
    actorResult: data.data.getActors,
  };
}

export default {
  components: {
    ListContainer,
    SceneCard,
  },
  head() {
    return {
      title: `Results for "${this.$route.query.q}"`,
    };
  },
  watchQuery: true,
  async asyncData({ query, error }) {
    try {
      const result = await searchAll(query.q);
      return result;
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
pre {
  margin-bottom: 0;
}

.category-header {
  font-size: 18px;
}
</style>
