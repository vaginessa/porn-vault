<template>
  <div style="display: flex">
    <div
      :color="color"
      @click="onClick($event, i)"
      :class="{
        'no-cursor': readonly,
        'hover inverted': !readonly,
      }"
      v-for="i in 5"
      :key="i"
    >
      <Star :size="size" :fillColor="color" v-if="renderFull(i) === 'full'" />
      <StarHalfFull :size="size" :fillColor="color" v-else-if="renderFull(i) === 'half'" />
      <StarOutline :size="size" :fillColor="color" v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";
import StarOutline from "vue-material-design-icons/StarOutline.vue";
import Star from "vue-material-design-icons/Star.vue";
import StarHalfFull from "vue-material-design-icons/StarHalfFull.vue";

export default defineComponent({
  components: {
    StarOutline,
    Star,
    StarHalfFull,
  },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 24,
    },
    color: {
      type: String,
      default: "#5a7aff",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    function renderFull(index: number) {
      if (index * 2 <= (props.value || 0)) {
        return "full";
      }
      if (props.value && props.value % 2 == 1 && index * 2 == props.value + 1) {
        return "half";
      }
      return "empty";
    }

    function onClick(event: MouseEvent, index: number) {
      if (props.readonly) {
        return;
      }

      const clickTarget = event.target as HTMLElement;
      const clickTargetWidth = clickTarget.clientWidth;
      const xCoordInClickTarget = event.clientX - clickTarget.getBoundingClientRect().left;

      let computedValue: number;
      if (clickTargetWidth / 2 > xCoordInClickTarget) {
        // clicked left
        computedValue = index * 2 - 1;
      } else {
        // clicked right
        computedValue = index * 2;
      }

      if (props.value == computedValue) {
        emit("input", 0);
        emit("change", 0);
      } else {
        emit("input", computedValue);
        emit("change", computedValue);
      }
    }

    return { onClick, renderFull };
  },
});
</script>

<style lang="scss" scoped>
.no-cursor {
  cursor: default !important;
}
</style>
