<template>
  <div class="error-container">
    <client-only v-if="img">
      <div
        class="background"
        :style="{
          'background-image': `url('/api/media/image/${img._id}?password=xxx')`,
        }"
      >
        <div style="flex-grow: 1"></div>
        <div style="display: flex; justify-content: center">
          <div class="card error-card rounded">
            <img width="40" height="40" src="/assets/favicon.png" alt="" />
            <div class="status">{{ error.statusCode }}</div>
            <div class="message">{{ error.message }}</div>
            <NuxtLink to="/">Go back</NuxtLink>
          </div>
        </div>
        <div style="flex-grow: 1"></div>
        <div
          v-if="img.scene && img.actors"
          style="display: inline-block; padding: 5px; background: #ffffff55; text-align: left"
        >
          <div style="font-size: 20px; font-weight: bold">
            {{ img.scene.name }}
          </div>
          <div style="font-size: 16px; margin-top: 5px; font-style: italic">
            starring {{ img.actors.map((a) => a.name).join(", ") }}
          </div>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
import axios from "axios";

import { getUrl } from "../client/util/url";

async function getRandomImage() {
  const res = await axios.post(
    getUrl("/api/ql", process.server),
    {
      query: `
        query($query: ImageSearchQuery!, $seed: String) {
          getImages(query: $query, seed: $seed) {
            items {
              _id
              actors {
                name
              }
              scene {
                name
              }
            }
          }
        }
      `,
      variables: {
        query: {
          query: "",
          skip: 0,
          take: 1,
          sortBy: "$shuffle",
        },
        seed: Date.now().toString(),
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
  return res.data.data.getImages.items[0];
}

export default defineComponent({
  props: ["error"],
  data() {
    return {
      img: null,
    };
  },
  async mounted() {
    const image = await getRandomImage();
    this.img = image;
  },
  layout: "empty",
});
</script>

<style>
* {
  font-family: Helvetica, sans-serif, Arial, serif;
}

body {
  margin: 0 !important;
}

.status {
  font-size: 40px;
  text-transform: uppercase;
  font-weight: bolder;
  margin-top: 10px;
}

.message {
  opacity: 0.66;
  font-weight: bold;
  margin-bottom: 25px;
}

a {
  text-decoration: none;
  color: #2244aa;
}

.background {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
}

.error-card {
  margin-top: 5px;
  text-align: center;
  padding: 10px 75px !important;
  background: #ffffffdf !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
}

.error-container {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}
</style>
