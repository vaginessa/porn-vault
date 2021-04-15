<template>
  <v-container fluid>
    <BindFavicon />
    <BindTitle value="Markers" />

    <v-navigation-drawer v-if="showSidenav" style="z-index: 14" v-model="drawer" clipped app>
      <v-container>
        <v-btn
          :disabled="refreshed"
          class="text-none mb-2"
          block
          color="primary"
          text
          @click="resetPagination"
          >Refresh</v-btn
        >

        <v-text-field
          @keydown.enter="resetPagination"
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
            <v-icon>{{ favoritesOnly ? "mdi-heart" : "mdi-heart-outline" }}</v-icon>
          </v-btn>

          <v-btn
            :color="bookmarksOnly ? 'primary' : undefined"
            icon
            @click="bookmarksOnly = !bookmarksOnly"
          >
            <v-icon>{{ bookmarksOnly ? "mdi-bookmark" : "mdi-bookmark-outline" }}</v-icon>
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

    <div class="mt-3" v-if="numResults && numPages > 1">
      <v-pagination
        @input="loadPage"
        v-model="page"
        :total-visible="9"
        :disabled="fetchLoader"
        :length="numPages"
      ></v-pagination>
      <div class="text-center mt-3">
        <v-text-field
          :disabled="fetchLoader"
          solo
          flat
          color="primary"
          v-model.number="page"
          placeholder="Page #"
          class="d-inline-block mr-2"
          style="width: 60px"
          hide-details
        >
        </v-text-field>
        <v-btn
          :disabled="fetchLoader"
          color="primary"
          class="text-none"
          text
          @click="loadPage(page)"
          >Load</v-btn
        >
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import ApolloClient from "../apollo";
import gql from "graphql-tag";
import { markerModule } from "../store/markers";
import DrawerMixin from "@/mixins/drawer";
import { mixins } from "vue-class-component";
import { contextModule } from "@/store/context";
import ILabel from "@/types/label";
import MarkerCard from "@/components/Cards/Marker.vue";
import actorFragment from "@/fragments/actor";
import { SearchStateManager, isQueryDifferent } from "../util/searchState";
import { Route } from "vue-router";
import { Dictionary } from "vue-router/types/router";

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
      text: "Added to collection",
      value: "addedOn",
    },
    {
      text: "Alphabetical",
      value: "rawName",
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
    this.refreshed = false;
  }

  searchStateManager = new SearchStateManager<{
    page: number;
    query: string;
    durationRange: number[];
    favoritesOnly: boolean;
    bookmarksOnly: boolean;
    ratingFilter: number;
    selectedLabels: { include: string[]; exclude: string[] };
    sortBy: string;
    sortDir: string;
  }>({
    localStorageNamer: (key: string) => `pm_marker${key[0].toUpperCase()}${key.substr(1)}`,
    props: {
      page: {
        default: () => 1,
      },
      query: true,
      favoritesOnly: true,
      bookmarksOnly: true,
      ratingFilter: { default: () => 0 },
      selectedLabels: { default: () => ({ include: [], exclude: [] }) },
      sortBy: { default: () => "relevance" },
      sortDir: {
        default: () => "desc",
      },
    },
  });

  get searchState() {
    return this.searchStateManager.state;
  }

  set page(page: number) {
    const x = Number(page);
    if (isNaN(x) || x <= 0 || x > this.numPages) {
      markerModule.setPage(1);
    } else {
      markerModule.setPage(x || 1);
    }
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

  refreshed = true;

  resetPagination() {
    this.searchState.page = 1;
    this.updateRoute(this.searchStateManager.toQuery());
  }

  @Watch("query")
  onQueryChange(newVal: string | null) {
    localStorage.setItem("pm_markerQuery", newVal || "");
    this.refreshed = false;
  }

  @Watch("selectedLabels")
  onLabelChange() {
    this.refreshed = false;
  }

  @Watch("ratingFilter", {})
  onRatingChange(newVal: number) {
    localStorage.setItem("pm_markerRating", newVal.toString());
    this.refreshed = false;
  }

  @Watch("favoritesOnly")
  onFavoriteChange(newVal: boolean) {
    localStorage.setItem("pm_markerFavorite", "" + newVal);
    this.refreshed = false;
  }

  @Watch("bookmarksOnly")
  onBookmarkChange(newVal: boolean) {
    localStorage.setItem("pm_markerBookmark", "" + newVal);
    this.refreshed = false;
  }

  @Watch("sortDir")
  onSortDirChange(newVal: string) {
    localStorage.setItem("pm_markerSortDir", newVal);
    this.refreshed = false;
  }

  @Watch("sortBy")
  onSortChange(newVal: string) {
    localStorage.setItem("pm_markerSortBy", newVal);
    this.refreshed = false;
  }

  @Watch("$route")
  onRouteChange(to: Route, from: Route) {
    if (isQueryDifferent(to.query as Dictionary<string>, from.query as Dictionary<string>)) {
      // Only update the state and reload, if the query changed => filters changed
      this.searchStateManager.parseFromQuery(to.query as Dictionary<string>);
      this.loadPage();
      return;
    }
  }

  async fetchPage(page: number, take = 24, random?: boolean, seed?: string) {
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
              actors {
                ...ActorFragment
              }
              thumbnail {
                _id
              }
            }
            numItems
            numPages
          }
        }
        ${actorFragment}
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
  }

  refreshPage() {
    this.loadPage();
  }

  loadPage() {
    this.fetchLoader = true;

    return this.fetchPage(this.searchState.page)
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

  updateRoute(query: { [x: string]: string }, replace = false, noChangeCb: Function | null = null) {
    if (isQueryDifferent(query, this.$route.query as Dictionary<string>)) {
      // Only change the current url if the new url will be different to avoid redundant navigation
      const update = {
        name: "scenes",
        query: {
          ...this.$route.query,
          ...query,
        },
      };
      if (replace) {
        this.$router.replace(update);
      } else {
        this.$router.push(update);
      }
    } else {
      noChangeCb?.();
    }
  }

  beforeMount() {
    this.searchStateManager.initState(this.$route.query as Dictionary<string>);
    this.updateRoute(this.searchStateManager.toQuery(), true, this.loadPage);

    ApolloClient.query({
      query: gql`
        {
          getLabels {
            _id
            name
            aliases
            color
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

<style scoped></style>
