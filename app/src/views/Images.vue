<template>
  <div>
    <v-navigation-drawer v-model="drawer" :permanent="$vuetify.breakpoint.mdAndUp" clipped app>
      <v-container>
        <v-text-field clearable color="accent" v-model="query" label="Search query"></v-text-field>

        <v-subheader>Labels</v-subheader>
        <v-chip-group
          active-class="accent--text"
          :items="allLabels"
          column
          v-model="selectedLabels"
          multiple
        >
          <div style="height: 300px; max-height:40vh; overflow-y:scroll">
            <v-chip v-for="label in allLabels" :key="label.id">{{ label.name }}</v-chip>
          </div>
        </v-chip-group>
      </v-container>
    </v-navigation-drawer>
    <h1 class="font-weight-light">Images</h1>

    <v-container fluid>
      <v-row v-if="!waiting">
        <v-col v-for="image in images" :key="image.id" cols="6" sm="4" md="3" lg="3">
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
      <div class="text-center" v-else>Keep on writing...</div>
    </v-container>

    <infinite-loading :identifier="infiniteId" @infinite="infiniteHandler">
      <div slot="no-results">
        <v-icon large>mdi-close</v-icon>
        <div>Nothing found!</div>
      </div>

      <div slot="spinner">
        <v-progress-circular indeterminate></v-progress-circular>
        <div>Loading...</div>
      </div>

      <div slot="no-more">
        <v-icon large>mdi-emoticon-wink</v-icon>
        <div>That's all!</div>
      </div>
    </infinite-loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import LabelSelector from "../components/LabelSelector.vue";
import InfiniteLoading from "vue-infinite-loading";
import { contextModule } from "../store/context";

@Component({
  components: {
    LabelSelector,
    InfiniteLoading
  }
})
export default class Home extends Vue {
  images = [] as any[];
  waiting = false;
  allLabels = [] as any[];
  selectedLabels = [] as number[];

  query = "";
  page = 0;

  infiniteId = 0;
  resetTimeout = null as any;

  get drawer() {
    return contextModule.showFilters;
  }

  set drawer(val: boolean) {
    contextModule.toggleFilters(val);
  }

  @Watch("selectedLabels")
  onLabelChange() {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
  }

  @Watch("query")
  onQueryChange() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    this.waiting = true;
    this.page = 0;
    this.images = [];

    this.resetTimeout = setTimeout(() => {
      this.waiting = false;
      this.infiniteId++;
    }, 500);
  }

  infiniteHandler($state) {
    this.fetchPage().then(items => {
      if (items.length) {
        this.page++;
        this.images.push(...items);
        $state.loaded();
      } else {
        $state.complete();
      }
    });
  }

  async fetchPage() {
    try {
      let include = "";

      if (this.selectedLabels.length)
        include =
          "include:" +
          this.selectedLabels.map(i => this.allLabels[i].id).join(",");

      const query = `query:'${this.query || ""}' ${include} page:${this.page}`;
      const result = await ApolloClient.query({
        query: gql`
          query($query: String) {
            getImages(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query
        }
      });

      return result.data.getImages;
    } catch (err) {
      throw err;
    }
  }

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
    ApolloClient.query({
      query: gql`
        {
          getLabels {
            id
            name
          }
        }
      `
    })
      .then(res => {
        this.allLabels = res.data.getLabels;
      })
      .catch(err => {
        console.error(err);
      });
  }
}
</script>
