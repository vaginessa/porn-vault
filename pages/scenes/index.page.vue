<template>
  <div :style="{ padding: '10px' }">
    <div>
      <b>{{ numItems }}</b> {{ numItems === 1 ? "scene" : "scenes" }} found
    </div>
    <list-container>
      <div v-for="scene in scenes" :key="scene._id">
        <scene-card style="height: 100%" :scene="scene" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts" setup>
import ListContainer from "../../components/list_container.vue";
import SceneCard from "../../components/scene_card.vue";

defineProps(["scenes", "numItems", "numPages"]);
</script>
