<template>
  <v-container fluid>
    <BindTitle value="Markers" />

    <div class="mr-3">
      <span class="display-1 font-weight-bold mr-2">{{ fetchLoader ? "-" : numResults }}</span>
      <span class="title font-weight-regular">markers found</span>
    </div>

    <v-row dense>
      <v-col class="mb-1" v-for="marker in markers" :key="marker._id" cols="6" md="4" lg="3" xl="6">
        <a v-ripple :href="sceneUrl(marker)">
          <v-img :src="thumbnail(marker)"></v-img>
          <div class="text-center mt-1">{{ marker.name }}</div>
        </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Axios from "axios";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import { markerModule } from "../store/markers";

@Component
export default class MarkerList extends Vue {
  markers = [] as any[];

  query = "";

  sortBy = "relevance";
  sortDir = "desc";

  ratingFilter = 0;
  favoritesOnly = false;
  bookmarksOnly = false;

  fetchError = false;
  fetchLoader = false;

  set page(page: number) {
    markerModule.setPage(page);
  }

  get page() {
    return markerModule.page;
  }

  get numResults() {
    return markerModule.numResults;
  }

  get numPages() {
    return markerModule.numPages;
  }

  sceneUrl(marker: any) {
    return `/#/scene/${marker.scene._id}?t=${marker.time}&mk_name=${marker.name}`;
  }

  thumbnail(marker: any) {
    if (marker.thumbnail)
      return `${serverBase}/image/${
        marker.thumbnail._id
      }?password=${localStorage.getItem("password")}`;
    return `${serverBase}/broken`;
  }

  async fetchPage(page: number, take = 24, random?: boolean, seed?: string) {
    try {
      let include = "";
      let exclude = "";

      /* if (this.selectedLabels.include.length)
        include = "include:" + this.selectedLabels.include.join(",");

      if (this.selectedLabels.exclude.length)
        exclude = "exclude:" + this.selectedLabels.exclude.join(","); */

      const query = `query:'${this.query ||
        ""}' ${include} ${exclude} take:${take} page:${page - 1} sortDir:${
        this.sortDir
      } sortBy:${random ? "$shuffle" : this.sortBy} favorite:${
        this.favoritesOnly ? "true" : "false"
      } bookmark:${this.bookmarksOnly ? "true" : "false"} rating:${
        this.ratingFilter
      }`;

      const result = await ApolloClient.query({
        query: gql`
          query($query: String, $seed: String) {
            getMarkers(query: $query, seed: $seed) {
              items {
                _id
                name
                time
                scene {
                  _id
                }
                thumbnail {
                  _id
                }
              }
              numItems
              numPages
            }
          }
        `,
        variables: {
          query,
          seed: seed || localStorage.getItem("pm_seed") || "default"
        }
      });

      return result.data.getMarkers;
    } catch (err) {
      throw err;
    }
  }

  refreshPage() {
    this.loadPage(markerModule.page);
  }

  loadPage(page: number) {
    this.fetchLoader = true;

    this.fetchPage(page)
      .then(result => {
        this.fetchError = false;
        markerModule.setPagination({
          numResults: result.numItems,
          numPages: result.numPages
        });
        this.markers = result.items;
      })
      .catch(err => {
        console.error(err);
        this.fetchError = true;
      })
      .finally(() => {
        this.fetchLoader = false;
      });
  }

  mounted() {
    if (!this.markers.length) this.refreshPage();
  }
}
</script>

<style scoped>
</style>