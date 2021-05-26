<template>
  <div>
    <div class="video-container">
      <video
        controls
        :poster="`/api/media/image/${scene.thumbnail._id}/thumbnail`"
        :src="`/api/media/scene/${scene._id}`"
      ></video>
    </div>
    <div class="scene-info info-section rounded">
      <div class="title">
        <b>{{ scene.name }}</b>
      </div>
    </div>
    <div class="scene-actors info-section rounded">
      <div class="title"><b>Starring</b></div>
      <list-container min="150px" max="1fr">
        <div
          style="display: flex; flex-direction: column"
          v-for="actor in scene.actors"
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
</template>

<script>
import axios from "axios";

import ListContainer from "../../components/list_container.vue";
import { getUrl } from "../../client/util/url";

async function fetchScene(id) {
  const { data } = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($id: String!) {
          getSceneById(id: $id) {
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
              thumbnail {
                _id
                color
              }
            }
            studio {
              name
            }
            markers {
              _id
              name
              time
              labels {
                _id
                name
                color
              }
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

  return data.data.getSceneById;
}

export default {
  components: {
    ListContainer,
  },
  head() {
    return {
      title: this.scene.name,
    };
  },
  async asyncData({ params, error }) {
    try {
      const scene = await fetchScene(params.id);

      if (!scene) {
        return error({
          statusCode: 404,
          message: "Scene not found",
        });
      }

      return { scene };
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
.title {
  font-size: 20px;
  margin-bottom: 10px;
}

video {
  display: block;
  width: 100%;
  object-fit: cover;
}

.info-section {
  margin-top: 25px;
  padding: 10px;
  border: 1px solid #d0d0d0;
}

.video-container {
  background: black;
}
</style>
