<template>
  <div :style="{ padding: '10px' }">
    <div>
      <b>{{ t("foundScenes", numItems) }}</b>
    </div>
    <list-container>
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import ListContainer from "../../components/list_container.vue";
import SceneCard from "../../components/scene_card.vue";

defineProps(["scenes", "numItems", "numPages"]);

const { t } = useI18n();
</script>
