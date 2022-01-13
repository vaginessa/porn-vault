<template>
  <input
    @input="($event) => update($event.target.value)"
    @keydown="emitKeydown"
    v-model="innerValue"
    type="text"
    :placeholder="placeholder"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const innerValue = ref(props.value);

    function update(str: string) {
      innerValue.value = str;
      emit("input", str);
    }

    function emitKeydown(event: any) {
      emit("keydown", event);
    }

    return {
      innerValue,
      update,
      emitKeydown,
    };
  },
});
</script>

<style scoped>
input {
  cursor: text;
  border: 2px solid #f0f0f0;
  font-weight: 600;
  border-radius: 4px;
  padding: 7px 12px;
  transition: all 0.1s ease-in-out;
  outline: none;
  font-size: 13px;
}

input:hover {
  background: #f0f0f0;
}

input:focus {
  background: #e5e5e5;
  border-color: #e5e5e5 !important;
}
</style>
