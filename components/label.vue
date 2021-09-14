<template>
  <div class="label">
    <div v-if="label.color" class="circle" :style="{ background: label.color }"></div>
    <div class="name">{{ label.name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    label: {
      type: Object as () => { color: string | null },
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.label {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  position: relative;
  padding: 0 6px;
  max-width: 100%;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 400;
  height: 24px;
  margin-right: 4px;
  margin-bottom: 4px;
  background: #60606050;
  color: black;
}

.label .name {
  opacity: 0.75;
}

.label .circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
}
</style>
