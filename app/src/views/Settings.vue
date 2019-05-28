<template>
  <v-container>
    <v-subheader>Settings</v-subheader>
    {{ $store.state.globals.settings }}
    <v-subheader>Custom fields</v-subheader>
    {{ $store.state.globals.customFields }}
  </v-container>
</template>

<script>
export default {};
</script>

<style>
</style>
