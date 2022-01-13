<template>
  <div v-if="img">
    <div>404 ERROR</div>
    <div>
      <img :src="`/api/media/image/${img._id}?password=xxx`" width="400" />
    </div>
  </div>
  <!--   <div class="error-container">
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
            <div class="status">{{ 404 }}</div>
            <div class="message">{{ "Error" }}</div>
            <a to="/"> <b>Go back</b></a>
          </div>
        </div>
        <div style="flex-grow: 1"></div>
        <div class="flex align-center" style="padding: 10px; background: #ffffff77">
          <div v-if="img.scene && img.actors" style="display: inline-block; text-align: left">
            <div style="font-size: 20px; font-weight: bold">
              {{ img.scene.name }}
            </div>
            <div style="font-size: 16px; margin-top: 5px; font-style: italic">
              starring {{ img.actors.map((a) => a.name).join(", ") }}
            </div>
          </div>
          <div style="flex-grow: 1"></div>
          <button @click="loadImage">Shuffle</button>
        </div>
      </div>
    </client-only>
  </div> -->
</template>

<script lang="ts" setup>
import Axios from "axios";
import { onMounted, ref } from "vue";

defineProps(["is404"]);

async function getRandomImage() {
  const res = await Axios.post(
    "/api/ql",
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

const img = ref<string | null>(null);

async function loadImage() {
  const image = await getRandomImage();
  img.value = image;
}

onMounted(() => {
  loadImage();
});
</script>

<style>
* {
  font-family: Helvetica, sans-serif, Arial, serif;
}

body {
  margin: 0 !important;
  overflow: hidden;
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
  max-width: 1000px;
}

.error-container {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
