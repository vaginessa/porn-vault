<template>
  <div class="image-container" ref="container" style="position: relative">
    <div class="img-overlay">
      <slot />
    </div>
    <img ref="image" :src="src" :alt="alt" />
  </div>
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
    },
    alt: {
      type: String,
      default: "Image",
    },
  },
  setup(props) {
    const container = ref(null);
    const image = ref(null);

    function resizeImage() {
      if (props.ratio) {
        const conEl = (container.value as unknown) as HTMLImageElement;
        const imgEl = (image.value as unknown) as HTMLImageElement;
        const w = imgEl.getBoundingClientRect().width;
        const h = props.ratio * w;
        conEl.style.height = `${h}px`;
      }
    }

    onMounted(() => {
      resizeImage();
      window.addEventListener("resize", resizeImage);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeImage);
    });

    return { container, image };
  },
});
</script>

<style scoped>
.image-container {
  position: relative;
}

img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.img-overlay {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
