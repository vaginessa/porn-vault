<template>
  <div>
    <div
      :style="{
        background: label.color || 'grey',
        color: isDarkColor(label.color || 'grey') ? 'white' : 'black',
      }"
      class="label"
      v-for="label in labels"
      :key="label._id"
    >
      {{ label.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";
import Color from "color";

export default defineComponent({
  props: {
    labels: {
      type: Array,
    },
  },
  setup() {
    function isDarkColor(hex: string): boolean {
      return new Color(hex).isDark();
    }

    return { isDarkColor };
  },
});
</script>

<style>
.label {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  position: relative;
  padding: 0 6px;
  max-width: 100%;
  border-radius: 4px;
  font-size: 12px;
  height: 24px;
  margin-right: 4px;
  margin-bottom: 4px;
  border: 1px solid #00000022;
}
</style>
