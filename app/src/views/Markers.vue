<template>
  <v-container fluid>
    <BindTitle value="Markers" />

    <v-navigation-drawer v-if="showSidenav" style="z-index: 14" v-model="drawer" clipped app>
      <v-container>
        <v-text-field
          solo
          flat
          single-line
          class="mb-2"
          hide-details
          clearable
          color="primary"
          v-model="query"
          label="Search query"
        ></v-text-field>

        <div class="d-flex align-center">
          <v-btn
            :color="favoritesOnly ? 'red' : undefined"
            icon
            @click="favoritesOnly = !favoritesOnly"
          >
            <v-icon>{{ favoritesOnly ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>

          <v-btn
            :color="bookmarksOnly ? 'primary' : undefined"
            icon
            @click="bookmarksOnly = !bookmarksOnly"
          >
            <v-icon>{{ bookmarksOnly ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <Rating @input="ratingFilter = $event" :value="ratingFilter" />
        </div>

        <Divider icon="mdi-label">Labels</Divider>

        <LabelFilter
          @change="onSelectedLabelsChange"
          class="mt-0"
          v-model="selectedLabels"
          :items="allLabels"
        />

        <Divider icon="mdi-sort">Sort</Divider>

        <v-select
          solo
          flat
          single-line
          hide-details
          color="primary"
          item-text="text"
          item-value="value"
          v-model="sortBy"
          placeholder="Sort by..."
          :items="sortByItems"
          class="mt-0 pt-0 mb-2"
        ></v-select>
        <v-select
          solo
          flat
          single-line
          :disabled="sortBy == 'relevance' || sortBy == '$shuffle'"
          hide-details
          color="primary"
          item-text="text"
          item-value="value"
          v-model="sortDir"
          placeholder="Sort direction"
          :items="sortDirItems"
        ></v-select>
      </v-container>
    </v-navigation-drawer>

    <div class="mr-3">
      <span class="display-1 font-weight-bold mr-2">{{ fetchLoader ? "-" : numResults }}</span>
      <span class="title font-weight-regular">markers found</span>
    </div>

    <v-row dense v-if="!fetchLoader && numResults">
      <v-col
        class="mb-1"
        v-for="(marker, i) in markers"
        :key="marker._id"
        cols="6"
        md="4"
        lg="3"
        xl="2"
      >
        <MarkerCard v-model="markers[i]" />
      </v-col>
    </v-row>
    <NoResults v-else-if="!fetchLoader && !numResults" />
    <Loading v-else />

    <v-pagination
      @input="loadPage"
      v-model="page"
      :total-visible="7"
      :disabled="fetchLoader"
      :length="numPages"
    ></v-pagination>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Axios from "axios";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import { markerModule } from "../store/markers";
import DrawerMixin from "@/mixins/drawer";
import { mixins } from "vue-class-component";
import { contextModule } from "@/store/context";
import ILabel from "@/types/label";
import MarkerCard from "@/components/MarkerCard.vue";

@Component({
  components: { MarkerCard },
})
export default class MarkerList extends mixins(DrawerMixin) {
  get showSidenav() {
    return contextModule.showSidenav;
  }

  markers = [] as any[];

  query = localStorage.getItem("pm_markerQuery") || "";

  sortDir = localStorage.getItem("pm_markerSortDir") || "desc";
  sortDirItems = [
    {
      text: "Ascending",
      value: "asc",
    },
    {
      text: "Descending",
      value: "desc",
    },
  ];

  sortBy = localStorage.getItem("pm_markerSortBy") || "relevance";
  sortByItems = [
    {
      text: "Relevance",
      value: "relevance",
    },
    {
      text: "A-Z",
      value: "name",
    },
    {
      text: "Added to collection",
      value: "addedOn",
    },
    {
      text: "Rating",
      value: "rating",
    },
    {
      text: "Bookmarked",
      value: "bookmark",
    },
    {
      text: "Random",
      value: "$shuffle",
    },
  ];

  ratingFilter = 0;
  favoritesOnly = false;
  bookmarksOnly = false;

  fetchError = false;
  fetchLoader = false;

  resetTimeout = null as NodeJS.Timeout | null;
  waiting = false;

  tryReadLabelsFromLocalStorage(key: string) {
    return (localStorage.getItem(key) || "").split(",").filter(Boolean) as string[];
  }

  allLabels = [] as ILabel[];

  selectedLabels = {
    include: this.tryReadLabelsFromLocalStorage("pm_markerInclude"),
    exclude: this.tryReadLabelsFromLocalStorage("pm_markerExclude"),
  };

  onSelectedLabelsChange(val: any) {
    localStorage.setItem("pm_markerInclude", val.include.join(","));
    localStorage.setItem("pm_markerExclude", val.exclude.join(","));

    markerModule.resetPagination();
  }

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

  @Watch("query")
  onQueryChange(newVal: string | null) {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    localStorage.setItem("pm_markerQuery", newVal || "");

    this.waiting = true;
    markerModule.resetPagination();

    this.resetTimeout = setTimeout(() => {
      this.waiting = false;
      this.loadPage(this.page);
    }, 500);
  }

  @Watch("selectedLabels")
  onLabelChange() {
    markerModule.resetPagination();
    this.loadPage(this.page);
  }

  @Watch("ratingFilter", {})
  onRatingChange(newVal: number) {
    localStorage.setItem("pm_markerRating", newVal.toString());
    markerModule.resetPagination();
    this.loadPage(this.page);
  }

  @Watch("favoritesOnly")
  onFavoriteChange(newVal: boolean) {
    localStorage.setItem("pm_markerFavorite", "" + newVal);
    markerModule.resetPagination();
    this.loadPage(this.page);
  }

  @Watch("bookmarksOnly")
  onBookmarkChange(newVal: boolean) {
    localStorage.setItem("pm_markerBookmark", "" + newVal);
    markerModule.resetPagination();
    this.loadPage(this.page);
  }

  async fetchPage(page: number, take = 24, random?: boolean, seed?: string) {
    try {
      const result = await ApolloClient.query({
        query: gql`
          query($query: MarkerSearchQuery!, $seed: String) {
            getMarkers(query: $query, seed: $seed) {
              items {
                _id
                name
                time
                favorite
                bookmark
                rating
                scene {
                  name
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
          query: {
            query: this.query,
            include: this.selectedLabels.include,
            exclude: this.selectedLabels.exclude,
            take,
            page: page - 1,
            sortDir: this.sortDir,
            sortBy: random ? "$shuffle" : this.sortBy,
            favorite: this.favoritesOnly,
            bookmark: this.bookmarksOnly,
            rating: this.ratingFilter,
          },
          seed: seed || localStorage.getItem("pm_seed") || "default",
        },
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
      .then((result) => {
        this.fetchError = false;
        markerModule.setPagination({
          numResults: result.numItems,
          numPages: result.numPages,
        });
        this.markers = result.items;
      })
      .catch((err) => {
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

  beforeMount() {
    ApolloClient.query({
      query: gql`
        {
          getLabels {
            _id
            name
            aliases
          }
        }
      `,
    })
      .then((res) => {
        this.allLabels = res.data.getLabels;
        if (!this.allLabels.length) {
          this.selectedLabels.include = [];
          this.selectedLabels.exclude = [];
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
</script>

<style scoped>
</style>