<template>
  <Link :to="url">
    <div class="icon">
      <slot name="icon" />
    </div>
    <div>{{ name }}</div>
  </Link>
</template>

<script lang="ts" setup>
import Link from "../renderer/Link.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.link {
  display: flex;
  align-items: center;
  justify-content: start;
  background: transparent;
  padding: 12px 0px;
  transition: background-color 0.05s ease-in-out;
  transition: border-color 0.05s ease-in-out;
  border-right: 4px solid transparent;
  cursor: pointer;
}

.pv-app.dark .link {
  color: white;
}

.link:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 40, 80, 0.33);
}

.pv-app.dark .link:hover {
  border-color: rgba(255, 40, 80, 0.5);
}

.link.active {
  font-weight: bold;
  border-color: rgba(255, 80, 160, 255) !important;
  background: #f0f0f0;
}

.pv-app.dark .link.active {
  background: #262631;
  border-color: rgba(255, 80, 160, 200) !important;
}

.icon {
  margin: 0 8px;
}
</style>
