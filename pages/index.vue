<template>
  <div>
    <div>Home</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta } from "@nuxtjs/composition-api";

export default defineComponent({
  components: {},
  head: {},
  setup() {
    const { title } = useMeta();

    title.value = "Home";

    return {};
  },
});
</script>

<style scoped></style>
