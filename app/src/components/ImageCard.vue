<template>
  <v-card width="100%" height="100%" v-if="image" outlined>
    <v-img
      eager
      class="hover"
      :src="imageLink(image)"
      :alt="image.name"
      :title="image.name"
      width="100%"
      height="100%"
      min-height="100px"
      @click="$emit('open')"
      v-ripple
    >
      <template v-slot:placeholder>
        <v-skeleton-loader width="100%" height="100%" tile loading type="image"></v-skeleton-loader>
      </template>
    </v-img>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";

@Component
export default class ImageCard extends Vue {
  @Prop(Object) image!: any;

  imageLink(image: any) {
    return `${serverBase}/image/${image.id}?password=${localStorage.getItem(
      "password"
    )}`;
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>