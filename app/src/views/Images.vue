<template>
  <div>
    <v-navigation-drawer v-model="drawer" :permanent="$vuetify.breakpoint.mdAndUp" clipped app>
      <v-container>
        <v-checkbox hide-details v-model="largeThumbs" label="Large thumbnails"></v-checkbox>
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
            <v-chip label small v-for="label in allLabels" :key="label.id">{{ label.name }}</v-chip>
          </div>
        </v-chip-group>
        <v-select
          hide-details
          color="accent"
          item-text="text"
          item-value="value"
          v-model="sortBy"
          placeholder="Sort by..."
          :items="sortByItems"
        ></v-select>
        <v-select
          :disabled="sortBy == 'relevance'"
          hide-details
          color="accent"
          item-text="text"
          item-value="value"
          v-model="sortDir"
          placeholder="Sort direction"
          :items="sortDirItems"
        ></v-select>
        <v-checkbox hide-details v-model="favoritesOnly" label="Show favorites only"></v-checkbox>
        <v-checkbox hide-details v-model="bookmarksOnly" label="Show bookmarks only"></v-checkbox>

        <v-rating
          half-increments
          @input="ratingFilter = $event * 2"
          :value="ratingFilter / 2"
          class="pb-0 pa-2"
          background-color="grey"
          color="amber"
          dense
          hide-details
        ></v-rating>
        <div class="pl-3 mt-1 med--text caption hover" @click="ratingFilter = 0">Reset rating filter</div>
      </v-container>
    </v-navigation-drawer>

    <div class="d-flex align-center">
      <h1 class="font-weight-light mr-3">Images</h1>
      <v-btn @click="openUploadDialog" icon>
        <v-icon>mdi-cloud-upload</v-icon>
      </v-btn>
    </div>

    <v-container fluid>
      <v-row v-if="!waiting">
        <v-col
          v-for="(image, index) in images"
          :key="image.id"
          :cols="largeThumbs ? 12 : 6"
          :sm="largeThumbs ? 12 : 4"
          :md="largeThumbs ? 12 : 3"
          :lg="largeThumbs ? 12 : 3"
          :xl="largeThumbs ? 12 : 3"
        >
          <ImageCard @open="lightboxIndex = index" width="100%" height="100%" :image="image" />
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

    <v-dialog
      :persistent="isUploading && uploadQueue.length"
      scrollable
      v-model="uploadDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>Upload image(s)</v-card-title>
        <v-card-text style="max-height: 400px">
          <v-file-input v-model="files" multiple @change="addFiles" placeholder="Select file(s)"></v-file-input>
          <div>
            <div class="mb-2 d-flex align-center" v-for="(item, i) in uploadItems" :key="item.b64">
              <v-avatar tile size="80">
                <v-img :src="item.b64"></v-img>
              </v-avatar>
              <v-text-field class="ml-2" hide-details v-model="uploadItems[i].name"></v-text-field>
              <v-spacer></v-spacer>
              <v-btn icon @click="uploadItems.splice(i, 1)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <div>{{ uploadQueue.length }} images queued.</div>
          <div v-if="isUploading && uploadQueue.length">Uploading {{ uploadQueue[0].name }}...</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="addToQueue" depressed color="primary" class="black--text">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <transition name="fade">
      <Lightbox
        @update="updateImage"
        @delete="removeImage"
        :items="images"
        :index="lightboxIndex"
        @index="lightboxIndex = $event"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import LabelSelector from "../components/LabelSelector.vue";
import InfiniteLoading from "vue-infinite-loading";
import { contextModule } from "../store/context";
import ImageCard from "../components/ImageCard.vue";
import Lightbox from "../components/Lightbox.vue";
import actorFragment from "../fragments/actor";
import imageFragment from "../fragments/image";

@Component({
  components: {
    LabelSelector,
    InfiniteLoading,
    ImageCard,
    Lightbox
  }
})
export default class ImagesView extends Vue {
  images = [] as any[];
  lightboxIndex = null as number | null;

  waiting = false;
  allLabels = [] as any[];
  selectedLabels = [] as number[];

  largeThumbs = false;

  query = "";
  page = 0;

  sortDir = "desc";
  sortDirItems = [
    {
      text: "Ascending",
      value: "asc"
    },
    {
      text: "Descending",
      value: "desc"
    }
  ];

  sortBy = "relevance";
  sortByItems = [
    {
      text: "Relevance",
      value: "relevance"
    },
    {
      text: "Added to libray",
      value: "addedOn"
    },
    {
      text: "Rating",
      value: "rating"
    }
  ];

  favoritesOnly = false;
  bookmarksOnly = false;
  ratingFilter = 0;

  infiniteId = 0;
  resetTimeout = null as any;

  uploadDialog = false;

  files = [] as File[];
  uploadItems = [] as { file: File; b64: string; name: string }[];

  uploadQueue = [] as { file: File; b64: string; name: string }[];
  isUploading = false;

  removeImage(index: number) {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!) {
          removeImages(ids: $ids)
        }
      `,
      variables: {
        ids: [this.images[index].id]
      }
    })
      .then(res => {
        this.images.splice(index, 1);
        this.lightboxIndex = null;
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {});
  }

  updateImage({
    index,
    key,
    value
  }: {
    index: number;
    key: string;
    value: any;
  }) {
    const images = this.images[index];
    images[key] = value;
    Vue.set(this.images, index, images);
  }

  addToQueue() {
    this.uploadQueue.push(...this.uploadItems);
    this.uploadItems = [];
    if (!this.isUploading) this.upload(this.uploadQueue[0]);
  }

  upload(image: { file: File; b64: string; name: string }) {
    this.isUploading = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($file: Upload!, $name: String) {
          uploadImage(file: $file, name: $name) {
            id
            name
          }
        }
      `,
      variables: {
        file: image.file,
        name: image.name
      },
      context: {
        hasUpload: true
      }
    })
      .then(res => {
        this.images.unshift(res.data.uploadImage);
        this.uploadQueue.shift();
        this.isUploading = true;

        if (this.uploadQueue.length) {
          this.upload(this.uploadQueue[0]);
        }
      })
      .catch(err => {
        this.uploadQueue = [];
        this.isUploading = false;
        this.uploadItems.push(...this.uploadQueue);
      });
  }

  readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) resolve(reader.result.toString());
        else reject("File error");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async addFiles(files: File[]) {
    for (const file of files) {
      const b64 = await this.readImage(file);

      if (this.uploadItems.find(i => i.b64 == b64)) continue;

      this.uploadItems.push({
        file,
        b64,
        name: file.name
      });
    }

    this.files = [];
  }

  openUploadDialog() {
    this.uploadDialog = true;
  }

  get drawer() {
    return contextModule.showFilters;
  }

  set drawer(val: boolean) {
    contextModule.toggleFilters(val);
  }

  @Watch("ratingFilter", {})
  onRatingChange(newVal: number) {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
  }

  @Watch("favoritesOnly")
  onFavoriteChange() {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
  }

  @Watch("bookmarksOnly")
  onBookmarkChange() {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
  }

  @Watch("sortDir")
  onSortDirChange() {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
  }

  @Watch("sortBy")
  onSortChange() {
    this.page = 0;
    this.images = [];
    this.infiniteId++;
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

      const query = `query:'${this.query || ""}' ${include} page:${
        this.page
      } sortDir:${this.sortDir} sortBy:${this.sortBy} favorite:${
        this.favoritesOnly ? "true" : "false"
      } bookmark:${this.bookmarksOnly ? "true" : "false"} rating:${
        this.ratingFilter
      }`;

      const result = await ApolloClient.query({
        query: gql`
          query($query: String) {
            getImages(query: $query) {
              ...ImageFragment
              actors {
                ...ActorFragment
              }
            }
          }
          ${imageFragment}
          ${actorFragment}
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
