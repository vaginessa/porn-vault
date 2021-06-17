<template>
  <div>
    <!-- Actors -->
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
    <!-- Actors end -->

    <!-- Scenes -->
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
    <!-- Scenes end -->

    <!-- Movies -->
    <div>
      <div class="category-header" style="margin-bottom: 5px">
        <pre><b>{{ movieResult.numItems }}</b> movies found</pre>
      </div>
      <div>
        <list-container>
          <div v-for="movie in movieResult.items" :key="movie._id">
            <div>
              <img
                style="width: 100%"
                :alt="movie.name"
                :src="`/api/media/image/${
                  movie.frontCover && movie.frontCover._id
                }/thumbnail?password=xxx`"
              />
            </div>
            <div>
              {{ movie.name }}
            </div>
          </div>
        </list-container>
      </div>
    </div>
    <!-- Movies end -->
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useRoute,
  ref,
  useFetch,
  useContext,
  useMeta,
  onMounted,
  ssrRef,
} from "@nuxtjs/composition-api";
import axios from "axios";

import ListContainer from "../components/list_container.vue";
import SceneCard from "../components/scene_card.vue";
import { getUrl } from "../client/util/url";
import { sceneCardFragment } from "../client/fragments/scene";

async function searchAll(query: string) {
  const { data } = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!, $mo: MovieSearchQuery!) {
          getScenes(query: $sc) {
            items {
              ...SceneCard
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
          getMovies(query: $mo) {
            items {
              _id
              name
              frontCover {
                _id
                color
              }
              actors {
                _id
                name
              }
            }
            numItems
          }
        }

        ${sceneCardFragment}
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
        mo: {
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
    movieResult: data.data.getMovies,
  };
}

export default defineComponent({
  components: {
    ListContainer,
    SceneCard,
  },
  watch: {
    "$route.query": "$fetch",
  },
  head: {},
  setup() {
    const { error } = useContext();
    const route = useRoute();

    const titleRef = ssrRef("", "title-ref");
    const { title } = useMeta();

    const sceneResult = ref([]);
    const actorResult = ref([]);
    const movieResult = ref([]);

    useFetch(async () => {
      try {
        const query = String(route.value.query.q);
        const result = await searchAll(query);

        sceneResult.value = result.sceneResult;
        actorResult.value = result.actorResult;
        movieResult.value = result.movieResult;

        titleRef.value = `Results for "${query}"`;
        title.value = titleRef.value;
      } catch (fetchError) {
        console.error(fetchError);
        if (!fetchError.response) {
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

    onMounted(() => {
      title.value = titleRef.value;
    });

    return { sceneResult, actorResult, movieResult };
  },
});
</script>

<style scoped>
pre {
  margin-bottom: 0;
}

.category-header {
  font-size: 18px;
}
</style>
