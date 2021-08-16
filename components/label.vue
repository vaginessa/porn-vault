<template>
  <div
    :style="{
      background: bgColor,
      color: textColor,
    }"
    class="label"
  >
    {{ label.name }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@nuxtjs/composition-api";
import { isDarkColor } from "../client/util/color";

export default defineComponent({
  props: {
    label: {
      type: Object as () => { color: string | null },
      required: true,
    },
  },
  setup(props) {
    const bgColor = computed(() => props.label.color || "grey");
    const isDark = computed(() => isDarkColor(bgColor.value));
    const textColor = computed(() => (isDark.value ? "white" : "black"));
    return { isDark, textColor, bgColor };
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
  font-size: 11.5px;
  font-weight: 400;
  height: 24px;
  margin-right: 4px;
  margin-bottom: 4px;
  border: 1px solid #00000022;
}
</style>
