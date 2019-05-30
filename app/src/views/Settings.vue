<template>
  <v-container>
    <v-subheader>Settings</v-subheader>
    {{ $store.state.globals.settings }}
    <v-subheader>Custom fields</v-subheader>
    {{ $store.state.globals.customFields }}
    <v-text-field v-model="field.name" label="Field name"></v-text-field>
    <v-select
      v-model="field.chosenType"
      :items="field.types"
      item-text="name"
      item-value="value"
      label="Field type"
    ></v-select>

    <v-combobox
      multiple
      clearable
      v-if="field.chosenType > 2"
      v-model="field.values"
      chips
      label="Preset values"
    ></v-combobox>
    <v-btn @click="createField">Create field</v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import CustomField, { CustomFieldType } from "@/classes/custom_field";

// Turn enum into array
function toArray(enumme: any) {
  return Object.keys(enumme)
    .filter((value: any) => isNaN(Number(value)) === false)
    .map(key => enumme[key]);
}

export default Vue.extend({
  data() {
    return {
      field: {
        name: "",
        chosenType: 0,
        types: [
          {
            name: "String",
            value: 0
          },
          {
            name: "Number",
            value: 1
          },
          {
            name: "Boolean",
            value: 2
          },
          {
            name: "Select",
            value: 3
          },
          {
            name: "Multi-Select",
            value: 4
          }
        ],
        values: []
      }
    };
  },
  methods: {
    createField() {
      let field = CustomField.create(
        this.field.name,
        this.field.chosenType > 2 ? this.field.values : null,
        this.field.chosenType
      );

      this.$store.commit("globals/addCustomField", field);
      this.$store.commit("actors/addCustomField", field);
      this.$store.commit("images/addCustomField", field);
      this.$store.commit("videos/addCustomField", field);
    }
  }
});
</script>

<style>
</style>
