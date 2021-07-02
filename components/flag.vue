<template>
  <img :title="name" :src="url" :width="width" :height="width / 1.5" />
</template>

<script lang="ts">
import { computed, defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    value: {
      type: String,
    },
    name: {
      type: String,
    },
    width: {
      type: Number,
      default: 30,
    },
  },
  setup(props) {
    const url = computed(() => `/flag/${props.value}`);
    return { url };
  },
});
</script>
