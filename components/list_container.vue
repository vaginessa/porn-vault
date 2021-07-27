<template>
  <div
    class="list-container"
    :style="{
      'grid-template-columns': `repeat(auto-fill, minmax(${min}, ${max}))`,
      'grid-gap': `${gap} ${gap}`,
    }"
  >
    <slot />
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    min: {
      type: String,
      default: "275px",
    },
    max: {
      type: String,
      default: "1fr",
    },
    gap: {
      type: String,
      default: "0.4em",
    },
  },
});
</script>

<style scoped>
.list-container {
  display: grid;
}
</style>
