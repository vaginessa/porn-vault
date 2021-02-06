<template>
  <v-container fluid>
    <BindFavicon />
    <BindTitle value="Scenes" />

    <v-banner app sticky v-if="selectedScenes.length">
      {{ selectedScenes.length }} scenes selected
      <template v-slot:actions>
        <v-btn text @click="selectedScenes = []" class="text-none">Deselect</v-btn>
        <v-btn @click="deleteSelectedScenesDialog = true" text class="text-none" color="error"
          >Delete</v-btn
        >
      </template>
    </v-banner>

    <v-navigation-drawer v-if="showSidenav" style="z-index: 14" v-model="drawer" clipped app>
      <v-container>
        <v-btn
          :disabled="searchState.refreshed"
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
          class="mb-2"
          hide-details
          clearable
          color="primary"
          :value="searchState.state.query"
          @input="searchState.onValueChanged('query', $event)"
          label="Search query"
          single-line
        ></v-text-field>

        <div class="d-flex align-center">
          <v-btn
            :color="searchState.state.favoritesOnly ? 'red' : undefined"
            icon
            @click="searchState.onValueChanged('favoritesOnly', !searchState.state.favoritesOnly)"
          >
            <v-icon>{{
              searchState.state.favoritesOnly ? "mdi-heart" : "mdi-heart-outline"
            }}</v-icon>
          </v-btn>

          <v-btn
            :color="searchState.state.bookmarksOnly ? 'primary' : undefined"
            icon
            @click="searchState.onValueChanged('bookmarksOnly', searchState.state.bookmarksOnly)"
          >
            <v-icon>{{
              searchState.state.bookmarksOnly ? "mdi-bookmark" : "mdi-bookmark-outline"
            }}</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <Rating
            @input="searchState.onValueChanged('ratingFilter', $event)"
            :value="searchState.state.ratingFilter"
          />
        </div>

        <Divider icon="mdi-label">Labels</Divider>

        <LabelFilter
          @input="searchState.onValueChanged('selectedLabels', $event)"
          class="mt-0"
          v-model="searchState.state.selectedLabels"
          :items="allLabels"
        />

        <Divider icon="mdi-account">Actors</Divider>

        <ActorSelector
          v-model="searchState.state.selectedActors"
          @input="searchState.onValueChanged('selectedActors', $event)"
          :multiple="true"
        />

        <Divider icon="mdi-camera">Studio</Divider>

        <StudioSelector
          v-model="searchState.state.selectedStudio"
          @input="searchState.onValueChanged('selectedStudio', $event)"
          :multiple="false"
        />

        <Divider icon="mdi-clock">Duration</Divider>

        <v-checkbox
          v-model="searchState.state.useDuration"
          @change="searchState.onValueChanged('useDuration', $event)"
          label="Filter by duration"
        ></v-checkbox>

        <v-range-slider
          :disabled="!searchState.state.useDuration"
          hide-details
          :max="durationMax"
          v-model="searchState.state.durationRange"
          @change="searchState.onValueChanged('durationRange', $event)"
          color="primary"
        ></v-range-slider>
        <div class="body-1 med--text text-center">
          <template v-if="searchState.state.durationRange[0] === durationMax">
            <span class="font-weight-bold"> unlimited</span>
          </template>
          <template v-else>
            <span class="font-weight-bold">{{ searchState.state.durationRange[0] }}</span> min
          </template>
          -
          <template v-if="searchState.state.durationRange[1] === durationMax">
            <span class="font-weight-bold"> unlimited</span>
          </template>
          <template v-else>
            <span class="font-weight-bold">{{ searchState.state.durationRange[1] }}</span> min
          </template>
        </div>

        <Divider icon="mdi-sort">Sort</Divider>

        <v-select
          solo
          flat
          single-line
          hide-details
          color="primary"
          item-text="text"
          item-value="value"
          v-model="searchState.state.sortBy"
          @change="searchState.onValueChanged('sortBy', $event)"
          placeholder="Sort by..."
          :items="sortByItems"
          class="mt-0 pt-0 mb-2"
        ></v-select>
        <v-select
          solo
          flat
          single-line
          :disabled="searchState.state.sortBy == 'relevance' || sortBy == '$shuffle'"
          hide-details
          color="primary"
          item-text="text"
          item-value="value"
          v-model="searchState.state.sortDir"
          @change="searchState.onValueChanged('sortDir', $event)"
          placeholder="Sort direction"
          :items="sortDirItems"
        ></v-select>
      </v-container>
    </v-navigation-drawer>

    <div class="text-center" v-if="fetchError">
      <div>There was an error</div>
      <v-btn class="mt-2" @click="loadPage">Try again</v-btn>
    </div>
    <div v-else>
      <div class="mb-2 d-flex align-center">
        <div class="mr-3">
          <span class="display-1 font-weight-bold mr-2">{{
            fetchLoader ? "-" : searchState.state.pagination.numResults
          }}</span>
          <span class="title font-weight-regular">scenes found</span>
        </div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" :loading="fetchingRandom" @click="getRandom" icon>
              <v-icon>mdi-shuffle-variant</v-icon>
            </v-btn>
          </template>
          <span>Get random scene</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              :disabled="searchState.state.sortBy != '$shuffle'"
              @click="rerollSeed"
              icon
            >
              <v-icon>mdi-dice-3-outline</v-icon>
            </v-btn>
          </template>
          <span>Reshuffle</span>
        </v-tooltip>
        <v-spacer></v-spacer>
        <div>
          <v-pagination
            v-if="!fetchLoader && $vuetify.breakpoint.mdAndUp"
            :value="searchState.state.pagination.page"
            @input="onPageChange"
            :total-visible="7"
            :disabled="fetchLoader"
            :length="searchState.state.pagination.numPages"
          ></v-pagination>
        </div>
      </div>
      <v-row v-if="!fetchLoader && searchState.state.pagination.numResults">
        <v-col
          v-for="(scene, i) in scenes"
          :key="scene._id"
          class="pa-1"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <scene-card
            :class="
              selectedScenes.length && !selectedScenes.includes(scene._id) ? 'not-selected' : ''
            "
            :showLabels="showCardLabels"
            v-model="scenes[i]"
            style="height: 100%"
          >
            <template v-slot:action="{ hover }">
              <v-fade-transition>
                <v-checkbox
                  v-if="hover || selectedScenes.includes(scene._id)"
                  color="primary"
                  :input-value="selectedScenes.includes(scene._id)"
                  @change="selectScene(scene._id)"
                  @click.native.stop.prevent
                  class="mt-0"
                  hide-details
                  :contain="true"
                ></v-checkbox>
              </v-fade-transition>
            </template>
          </scene-card>
        </v-col>
      </v-row>
      <NoResults v-else-if="!fetchLoader && !searchState.state.pagination.numResults" />
      <Loading v-else />
    </div>
    <div
      class="mt-3"
      v-if="searchState.state.pagination.numResults && searchState.state.pagination.numPages > 1"
    >
      <v-pagination
        :value="searchState.state.pagination.page"
        @input="onPageChange"
        :total-visible="7"
        :disabled="fetchLoader"
        :length="searchState.state.pagination.numPages"
      ></v-pagination>
    </div>

    <v-dialog scrollable v-model="createSceneDialog" max-width="400px">
      <v-card :loading="addSceneLoader">
        <v-card-title>Add new scene</v-card-title>
        <v-card-text style="max-height: 90vh">
          <v-form v-model="validCreation">
            <v-text-field
              :rules="sceneNameRules"
              color="primary"
              v-model="createSceneName"
              placeholder="Name"
            />

            <ActorSelector class="mb-2" v-model="createSceneActors" />

            <v-chip
              label
              @click:close="createSelectedLabels.splice(i, 1)"
              class="mr-1 mb-1"
              close
              small
              outlined
              v-for="(name, i) in labelNames(createSelectedLabels)"
              :key="name"
              >{{ name }}</v-chip
            >
            <v-chip
              label
              :class="`mr-1 mb-1 ${$vuetify.theme.dark ? 'black--text' : 'white--text'}`"
              @click="openLabelSelectorDialog"
              color="primary"
              dark
              small
              >+ Select labels</v-chip
            >
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text class="text-none" :disabled="!validCreation" color="primary" @click="addScene"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog scrollable v-model="labelSelectorDialog" max-width="400px">
      <v-card>
        <v-card-title>Select labels for '{{ createSceneName }}'</v-card-title>

        <v-card-text style="max-height: 400px">
          <LabelSelector :items="allLabels" v-model="createSelectedLabels" />
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="createSelectedLabels = []" text class="text-none">Clear</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="labelSelectorDialog = false" text color="primary" class="text-none"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- <v-dialog :persistent="isUploadingScene" v-model="uploadDialog" max-width="400px">
      <SceneUploader @update-state="isUploadingScene = $event" @uploaded="scenes.unshift($event)" />
    </v-dialog>-->

    <v-dialog v-model="deleteSelectedScenesDialog" max-width="400px">
      <v-card>
        <v-card-title>Really delete {{ selectedScenes.length }} scenes?</v-card-title>
        <v-card-text>
          <v-alert v-if="willDeleteSceneFiles" type="error"
            >This will absolutely annihilate the original source files on disk</v-alert
          >
          <v-checkbox
            color="error"
            v-model="deleteSceneImages"
            label="Delete images as well"
          ></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="text-none" color="error" text @click="deleteSelection">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import ApolloClient, { serverBase } from "@/apollo";
import gql from "graphql-tag";
import SceneCard from "@/components/Cards/Scene.vue";
import sceneFragment from "@/fragments/scene";
import actorFragment from "@/fragments/actor";
import studioFragment from "@/fragments/studio";
import LabelSelector from "@/components/LabelSelector.vue";
import { contextModule } from "@/store/context";
import ActorSelector from "@/components/ActorSelector.vue";
import StudioSelector from "@/components/StudioSelector.vue";
import SceneUploader from "@/components/SceneUploader.vue";
import IScene from "@/types/scene";
import IActor from "@/types/actor";
import ILabel from "@/types/label";
import DrawerMixin from "@/mixins/drawer";
import { mixins } from "vue-class-component";
import { sceneModule } from "@/store/scene";
import { Route } from "vue-router";
import { Dictionary } from "vue-router/types/router";
import { SearchState } from "../util/searchState";

@Component({
  components: {
    SceneCard,
    LabelSelector,
    ActorSelector,
    SceneUploader,
    StudioSelector,
  },
})
export default class SceneList extends mixins(DrawerMixin) {
  get showSidenav() {
    return contextModule.showSidenav;
  }

  scenes = [] as IScene[];

  rerollSeed() {
    const seed = Math.random().toString(36);
    localStorage.setItem("pm_seed", seed);
    if (this.searchState.state.sortBy === "$shuffle") {
      this.loadPage();
    }
    return seed;
  }

  fetchLoader = false;
  fetchError = false;
  fetchingRandom = false;

  searchState = new SearchState<{
    pagination: { page: number; numResults: number; numPages: number };
    query: string;
    durationRange: number[];
    favoritesOnly: boolean;
    bookmarksOnly: boolean;
    ratingFilter: number;
    selectedLabels: { include: string[]; exclude: string[] };
    selectedActors: IActor[];
    selectedStudio: { _id: string; name: string };
    useDuration: boolean;
    sortBy: string;
    sortDir: string;
  }>({
    localStorageNamer: (key: string) => `pm_scene${key[0].toUpperCase()}${key.substr(1)}`,
    props: {
      pagination: {
        localStorageKey: "page",
        default: () => ({ page: 1, numResults: 0, numPages: 0 }),
        serialize: (pagination: { page: number }) => pagination.page.toString(),
        deserialize: (val, form) => ({
          numResults: 0,
          numPages: 0,
          ...(form.pagination || {}),
          page: +val || 1,
        }),
      },
      query: true,
      favoritesOnly: true,
      bookmarksOnly: true,
      ratingFilter: { default: () => 0 },
      selectedLabels: { default: () => ({ include: [], exclude: [] }) },
      selectedActors: { default: () => [] },
      selectedStudio: true,
      useDuration: true,
      durationRange: {
        default: () => [0, this.durationMax],
      },
      sortBy: true,
      sortDir: true,
    },
  });

  get selectedActorIds() {
    return this.searchState.state.selectedActors.map((ac) => ac._id);
  }

  allLabels = [] as ILabel[];

  validCreation = false;
  createSceneDialog = false;
  createSceneName = "";
  createSceneActors = [] as IActor[];
  createSelectedLabels = [] as number[];
  labelSelectorDialog = false;
  addSceneLoader = false;

  sceneNameRules = [(v) => (!!v && !!v.length) || "Invalid scene name"];

  @Watch("$route")
  onRouteChange(to: Route, from: Route) {
    if (!Object.entries(to.query).some(([prop, val]) => val !== from.query[prop])) {
      return;
    }
    this.searchState.parseFromQuery(to.query as Dictionary<string>);
    this.loadPage();
  }

  onPageChange(page: number) {
    this.searchState.onValueChanged("pagination", { ...this.searchState.state.pagination, page });
    this.updateRoute({ page: this.searchState.state.pagination.page.toString() });
  }

  updateRoute(query: { [x: string]: string }, replace = false, noChangeCb: Function | null = null) {
    if (Object.entries(query).some(([prop, value]) => this.$route.query[prop] !== value)) {
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

  durationMax = parseInt(localStorage.getItem("pm_durationFilterMax") || "180") || 180;

  sortDir = localStorage.getItem("pm_sceneSortDir") || "desc";
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

  sortBy = localStorage.getItem("pm_sceneSortBy") || "relevance";
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
      text: "Rating",
      value: "rating",
    },
    {
      text: "Views",
      value: "numViews",
    },
    {
      text: "Duration",
      value: "duration",
    },
    {
      text: "Resolution",
      value: "resolution",
    },
    {
      text: "Size",
      value: "size",
    },
    {
      text: "Release date",
      value: "releaseDate",
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

  uploadDialog = false;
  isUploadingScene = false;

  selectedScenes = [] as string[];
  deleteSelectedScenesDialog = false;
  deleteSceneImages = false;

  labelClasses(label: ILabel) {
    if (this.searchState.state.selectedLabels.include.includes(label._id))
      return "font-weight-bold primary--text";
    else if (this.searchState.state.selectedLabels.exclude.includes(label._id))
      return "font-weight-bold error--text";
    return "";
  }

  get showCardLabels() {
    return contextModule.showCardLabels;
  }

  selectScene(id) {
    const sceneIdx = this.selectedScenes.findIndex((sid) => sid === id);
    if (sceneIdx !== -1) {
      this.selectedScenes.splice(sceneIdx, 1);
    } else {
      this.selectedScenes.push(id);
    }
  }

  get willDeleteSceneFiles() {
    return this.selectedScenes.some((id) => {
      const scene = this.scenes.find((sc) => sc._id === id);
      return scene && !!scene["path"];
    });
  }

  deleteSelection() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $deleteImages: Boolean) {
          removeScenes(ids: $ids, deleteImages: $deleteImages)
        }
      `,
      variables: {
        ids: this.selectedScenes,
        deleteImages: this.deleteSceneImages,
      },
    })
      .then((res) => {
        this.scenes = this.scenes.filter(
          (scene) => !this.selectedScenes.find((sid) => sid === scene._id)
        );
        this.selectedScenes = [];
        this.deleteSelectedScenesDialog = false;
        this.deleteSceneImages = false;
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {});
  }

  openUploadDialog() {
    this.uploadDialog = true;
  }

  labelIDs(indices: number[]) {
    return indices.map((i) => this.allLabels[i]).map((l) => l._id);
  }

  labelNames(indices: number[]) {
    return indices.map((i) => this.allLabels[i].name);
  }

  openLabelSelectorDialog() {
    if (!this.allLabels.length) {
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
          this.labelSelectorDialog = true;
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      this.labelSelectorDialog = true;
    }
  }

  addScene() {
    this.addSceneLoader = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($name: String!, $labels: [String!], $actors: [String!]) {
          addScene(name: $name, labels: $labels, actors: $actors) {
            ...SceneFragment
            actors {
              ...ActorFragment
            }
            studio {
              ...StudioFragment
            }
          }
        }
        ${sceneFragment}
        ${actorFragment}
        ${studioFragment}
      `,
      variables: {
        name: this.createSceneName,
        actors: this.createSceneActors.map((a) => a._id),
        labels: this.labelIDs(this.createSelectedLabels),
      },
    })
      .then((res) => {
        this.loadPage();
        this.createSceneDialog = false;
        this.createSceneName = "";
        this.createSceneActors = [];
        this.createSelectedLabels = [];
      })
      .catch(() => {})
      .finally(() => {
        this.addSceneLoader = false;
      });
  }

  openCreateDialog() {
    this.createSceneDialog = true;
  }

  sceneLabels(scene: any) {
    return scene.labels.map((l) => l.name).sort();
  }

  sceneActorNames(scene: any) {
    return scene.actors.map((a) => a.name).join(", ");
  }

  sceneThumbnail(scene: any) {
    if (scene.thumbnail)
      return `${serverBase}/media/image/${scene.thumbnail._id}?password=${localStorage.getItem(
        "password"
      )}`;
    return "";
  }

  resetPagination() {
    this.searchState.state.pagination.page = 1;
    this.updateRoute(this.searchState.toQuery());
  }

  getRandom() {
    this.fetchingRandom = true;
    this.fetchPage(1, 1, true, Math.random().toString())
      .then((result) => {
        // @ts-ignore
        this.$router.push({ name: "scene-details", params: { id: result.items[0]._id } });
      })
      .catch((err) => {
        this.fetchingRandom = false;
      });
  }

  async fetchPage(page: number, take = 24, random?: boolean, seed?: string) {
    const result = await ApolloClient.query({
      query: gql`
        query($query: SceneSearchQuery!, $seed: String) {
          getScenes(query: $query, seed: $seed) {
            items {
              ...SceneFragment
              actors {
                ...ActorFragment
              }
              studio {
                ...StudioFragment
              }
            }
            numItems
            numPages
          }
        }
        ${sceneFragment}
        ${actorFragment}
        ${studioFragment}
      `,
      variables: {
        query: {
          query: this.searchState.state.query || "",
          take,
          page: page - 1,
          actors: this.selectedActorIds,
          include: this.searchState.state.selectedLabels.include,
          exclude: this.searchState.state.selectedLabels.exclude,
          sortDir: this.searchState.state.sortDir,
          sortBy: random ? "$shuffle" : this.searchState.state.sortBy,
          favorite: this.searchState.state.favoritesOnly,
          bookmark: this.searchState.state.bookmarksOnly,
          rating: this.searchState.state.ratingFilter,
          durationMin:
            this.searchState.state.useDuration &&
            this.searchState.state.durationRange[0] !== this.durationMax
              ? this.searchState.state.durationRange[0] * 60
              : null,
          durationMax:
            this.searchState.state.useDuration &&
            this.searchState.state.durationRange[1] !== this.durationMax
              ? this.searchState.state.durationRange[1] * 60
              : null,
          studios: this.searchState.state.selectedStudio
            ? this.searchState.state.selectedStudio._id
            : null,
        },
        seed: seed || localStorage.getItem("pm_seed") || "default",
      },
    });

    return result.data.getScenes;
  }

  loadPage() {
    this.fetchLoader = true;
    this.selectedScenes = [];

    return this.fetchPage(this.searchState.state.pagination.page)
      .then((result) => {
        this.searchState.refreshed = true;
        this.fetchError = false;
        this.searchState.state.pagination = {
          ...this.searchState.state.pagination,
          numResults: result.numItems,
          numPages: result.numPages,
        };
        this.scenes = result.items;
      })
      .catch((err) => {
        console.error(err);
        this.fetchError = true;
      })
      .finally(() => {
        this.fetchLoader = false;
      });
  }

  beforeMount() {
    this.searchState.init(this.$route.query as Dictionary<string>);
    this.updateRoute(this.searchState.toQuery(), true, this.loadPage);

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
          this.searchState.state.selectedLabels.include = [];
          this.searchState.state.selectedLabels.exclude = [];
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
</script>

<style lang="scss">
.not-selected {
  transition: all 0.15s ease-in-out;
  filter: brightness(0.6);
}
</style>
