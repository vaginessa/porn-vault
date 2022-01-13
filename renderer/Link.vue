<template>
  <a @click="nav" :class="{ hover: true, link: true, active: pageContext.urlPathname === to }">
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { navigate, useClientRouter } from "vite-plugin-ssr/client/router";

import { usePageContext } from "./usePageContext";

const pageContext = usePageContext() as any;

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
});

function nav() {
  navigate(props.to);
}
</script>

<style scoped></style>
