<template>
  <div
    class="card card-layout rounded"
    :style="{
      background: `${cardColor} !important`,
    }"
  >
    <nuxt-link :to="to">
      <responsive-image
        :ratio="ratio"
        :src="`/api/media/image/${thumbnail && thumbnail._id}/thumbnail?password=xxx`"
        class="thumbnail"
        style="background: #303030"
        hover
      >
        <slot name="overlay" />
      </responsive-image>
    </nuxt-link>

    <div
      class="body"
      :style="{
        color: 'black',
      }"
    >
      <slot name="body" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@nuxtjs/composition-api";
import Color from "color";

import ResponsiveImage from "./image.vue";

const MAX_SATURATION_LIGHT = 32;

export function ensureLightColor(hex: string): string {
  const col = Color(hex);
  return Color([col.hue(), Math.min(MAX_SATURATION_LIGHT, col.saturationv()), 100], "hsv").hex();
}

export default defineComponent({
  components: { ResponsiveImage },
  props: {
    to: {
      type: String,
    },
    thumbnail: {
      type: Object,
    },
    ratio: {
      type: Number,
    },
  },
  setup(props) {
    const cardColor = computed(() => {
      const thumb = props.thumbnail as { _id: string; color: string } | undefined;
      if (!thumb || !thumb.color) {
        return "white";
      }
      return ensureLightColor(thumb.color);
    });

    return {
      cardColor,
    };
  },
});
</script>

<style>
.card {
  background: white;
  overflow: hidden;
  box-shadow: 0 0.6px 1.3px rgba(0, 0, 0, 0.06), 0 5px 10px rgba(0, 0, 0, 0.12);
}

.card-layout {
  display: flex;
  flex-direction: column;
}

.card .body {
  text-align: left;
  flex-grow: 1;
  padding: 8px 8px;
}

.card .thumbnail {
  display: flex;
  align-items: center;
}
</style>
