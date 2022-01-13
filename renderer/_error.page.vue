<template>
  <h2 style="text-align: center">Error - 404</h2>
  <div v-if="img" class="flex content-center">
    <div>
      <img
        class="shadow"
        style="border-radius: 10px; width: 100%; max-height: 50vh; object-fit: contain"
        :src="`/api/media/image/${img._id}?password=xxx`"
      />
    </div>
  </div>
  <div v-if="img" style="text-align: center">
    <h4 style="margin-bottom: 8px">
      <Link :to="`/scene/${img.scene._id}`">
        {{ img.scene.name }}
      </Link>
    </h4>
    <div style="font-size: 16px; font-style: italic; margin-bottom: 16px">
      starring {{ img.actors.map((a) => a.name).join(", ") }}
    </div>
    <button @click="loadImage">Shuffle</button>
    <div style="margin-top: 10px; opacity: 0.8" v-if="count > 10">
      <i>Stop shuffling and get back to the real content!</i>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Axios from "axios";
import { onMounted, ref } from "vue";
import Link from "./Link.vue";

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
                _id
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
const count = ref(0);

async function loadImage() {
  const image = await getRandomImage();
  img.value = image;
  count.value++;
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
