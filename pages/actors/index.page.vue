<template>
  <div :style="{ padding: '10px' }">
    <div>
      <b>{{ t("foundActors", numItems) }}</b>
    </div>
    <list-container>
      <div v-for="actor in actors" :key="actor._id">
        <actor-card style="height: 100%" :actor="actor" />
      </div>
    </list-container>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import ListContainer from "../../components/list_container.vue";
import ActorCard from "../../components/actor_card.vue";

defineProps(["actors", "numItems", "numPages"]);

const { t } = useI18n();
</script>
