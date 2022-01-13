<template>
  <div>
    <div>
      <Label :label="label" v-for="label in labelsToShow" :key="label._id"> </Label>
    </div>
    <div>
      <slot name="extra" v-if="labelsToShow.length > limit"> </slot>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 2px; text-align: center">
      <!-- Expand -->
      <div class="expand-btn hover" @click="toggleLimit" v-if="labels.length > labelsToShow.length">
        <svg
          style="width: 24px; height: 24px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <!-- Collapse -->
      <div class="collapse-btn hover" @click="toggleLimit" v-if="labelsToShow.length > limit">
        <svg
          style="width: 24px; height: 24px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Label from "./label.vue";

export default defineComponent({
  components: {
    Label,
  },
  props: {
    labels: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      default: 999,
    },
  },
  setup(props) {
    const limit = ref(props.limit);

    function toggleLimit() {
      // Collapse
      if (limit.value !== props.limit) {
        limit.value = props.limit;
      }
      // Expand (show all)
      else {
        limit.value = 999;
      }
    }

    const labelsToShow = computed(() => props.labels.slice(0, limit.value));

    return { labelsToShow, toggleLimit };
  },
});
</script>

<style scoped>
.expand-btn,
.collapse-btn {
  display: flex;
  align-items: center;
}

.expand-btn:hover,
.collapse-btn:hover {
  color: #660055;
}
</style>
