<template>
  <div v-if="actor">
    <div>
      <ResponsiveImage
        :ratio="1 / 2.75"
        style="display: block; width: 100%; height: auto"
        :src="actor.hero ? `/api/media/image/${actor.hero._id}` : null"
        :color="actor.avatar && actor.avatar.color"
        :height="100"
      />
    </div>
    <div class="actor-content">
      <div style="padding: 0 10px; display: flex; align-items: center">
        <img
          class="actor-avatar avatar shadow"
          :width="120"
          :height="120"
          :src="`/api/media/image/${actor.avatar && actor.avatar._id}/thumbnail`"
          :style="{
            'border-width': '4px',
            'border-style': 'solid',
            'border-color': actor.avatar.color || 'white',
            'margin-right': '10px',
            'box-shadow': 'rgba(0, 0, 0, 0.2) 2.5px 2.5px 3px !important',
          }"
        />
        <div style="height: 100%; display: flex; padding-top: 60px; flex: 1; align-items: center">
          <div style="margin-right: 5px" v-if="actor.nationality">
            <flag :name="actor.nationality.name" :width="25" :value="actor.nationality.alpha2" />
          </div>
          <div style="margin-right: 5px; font-size: 20px">
            {{ actor.name }}
          </div>
          <div style="opacity: 0.75" v-if="actor.age">({{ actor.age }})</div>
          <div style="flex-grow: 1"></div>
          <!-- <div style="font-size: 20px">{{ actor.age }} years old</div> -->
          <div style="margin-right: 5px">
            <svg
              v-if="!actor.favorite"
              style="width: 24px; height: 24px"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <svg
              style="fill: red; width: 24px; height: 24px"
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <svg
              style="width: 24px; height: 24px"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
        </div>
      </div>
      <div style="padding: 10px 25px">
        {{ actor }}
      </div>
    </div>
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
} from "@nuxtjs/composition-api";
import axios from "axios";

import LabelGroup from "../../components/label_group.vue";
import ListContainer from "../../components/list_container.vue";
import { getUrl } from "../../client/util/url";
import ResponsiveImage from "../../components/image.vue";
import Flag from "../../components/flag.vue";

async function fetchActor(id: string) {
  const { data } = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($id: String!) {
          getActorById(id: $id) {
            _id
            name
            age
            favorite
            bookmark
            rating
            nationality {
              name
              alpha2
            }
            avatar {
              _id
              color
            }
            hero {
              _id
              color
            }
          }
        }
      `,
      variables: {
        id,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return data.data.getActorById as { name: string };
}

export default defineComponent({
  components: {
    ListContainer,
    LabelGroup,
    ResponsiveImage,
    Flag,
  },
  head: {},
  setup() {
    const { error } = useContext();
    const route = useRoute();
    const { title } = useMeta();

    const actor = ref<{ name: string } | null>(null);

    useFetch(async () => {
      try {
        actor.value = await fetchActor(route.value.params.id);

        if (!actor.value) {
          return error({
            statusCode: 404,
            message: "Actor not found",
          });
        }

        title.value = actor.value!.name;
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
    });

    return { actor };
  },
});
</script>

<style scoped>
.actor-content {
  margin-top: -60px;
  position: relative;
}
</style>
