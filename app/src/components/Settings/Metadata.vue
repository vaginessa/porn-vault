<template>
  <div>
    <v-card-title class="pl-0 pb-0">Custom Data Fields</v-card-title>
    <v-card class="mb-2">
      <v-card-text>
        <CustomFieldCreator />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CustomFieldCreator from "@/components/CustomFieldCreator.vue";

@Component({
  components: {
    CustomFieldCreator,
  },
})
export default class CustomFields extends Vue {}
</script>
