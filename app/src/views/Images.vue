<template>
  <div>
    <div v-if="!fetchLoader">
      <h1 class="font-weight-light">Images</h1>
      <v-container fluid>
        <v-row>
          <v-col v-for="image in images" :key="image.id" cols="6" sm="4">
            <v-img
              eager
              :src="imageLink(image)"
              class="image"
              :alt="image.name"
              :title="image.name"
              width="100%"
              height="100%"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
    <div v-else class="text-center">
      <p>Loading...</p>
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import LabelSelector from "../components/LabelSelector.vue";

@Component({
  components: {
    LabelSelector
  }
})
export default class Home extends Vue {
  images = [] as any[];
  fetchLoader = false;

  imageLink(image: any) {
    return `${serverBase}/image/${image.id}?password=${localStorage.getItem(
      "password"
    )}`;
  }

  labelAliases(label: any) {
    return label.aliases
      .slice()
      .sort()
      .join(", ");
  }

  beforeMount() {
    this.fetchLoader = true;
    ApolloClient.query({
      query: gql`
        {
          getImages {
            id
            name
          }
        }
      `
    })
      .then(res => {
        this.images = res.data.getImages;
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.fetchLoader = false;
      });
  }
}
</script>
