<template>
  <img ref="image" :src="src" :alt="alt" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    src: {
      type: String,
      required: true,
    },
    ratio: {
      type: Number,
      required: true,
    },
    alt: {
      type: String,
      default: "Image",
    },
  },
  setup(props) {
    const image = ref(null);

    function resizeImage() {
      const el = (image.value as unknown) as HTMLImageElement;
      const w = el.getBoundingClientRect().width;
      const h = props.ratio * w;
      el.style.height = `${h}px`;
    }

    onMounted(() => {
      resizeImage();
      window.addEventListener("resize", resizeImage);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeImage);
    });

    return { image };
  },
});
</script>

<style scoped>
img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
