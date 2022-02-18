<template>
  <input type="text" :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script lang="ts">
import { defineProps } from "vue";

defineProps(["value"]);
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
