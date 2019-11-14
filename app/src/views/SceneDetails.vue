<template>
  <div>
    <div v-if="currentScene">
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="3" xl="2">
          <v-container>
            <v-img class="elevation-4" aspect-ratio="1" cover :src="thumbnail"></v-img>
          </v-container>
        </v-col>
        <v-col cols="12" sm="8" md="8" lg="9" xl="10">
          <div v-if="currentScene.releaseDate">
            <div class="d-flex align-center">
              <v-icon>mdi-calendar</v-icon>
              <v-subheader>Release Date</v-subheader>
            </div>
            <div class="med--text pa-2">{{ releaseDate }}</div>
          </div>

          <div v-if="currentScene.description">
            <div class="d-flex align-center">
              <v-icon>mdi-text</v-icon>
              <v-subheader>Description</v-subheader>
            </div>
            <div
              class="pa-2 med--text"
              v-if="currentScene.description"
            >{{ currentScene.description }}</div>
          </div>

          <div class="d-flex align-center">
            <v-icon>mdi-star</v-icon>
            <v-subheader>Rating</v-subheader>
          </div>
          <v-rating
            half-increments
            @input="rate"
            class="pa-2"
            :value="currentScene.rating / 2"
            background-color="grey"
            color="amber"
            dense
          ></v-rating>
          <div class="d-flex align-center">
            <v-icon>mdi-label</v-icon>
            <v-subheader>Labels</v-subheader>
          </div>
          <div class="pa-2">
            <v-chip
              class="mr-1 mb-1"
              small
              outlined
              v-for="label in labelNames"
              :key="label"
            >{{ label }}</v-chip>

            <v-chip color="accent" v-ripple @click="openLabelSelector" small class="mr-1 mb-1">+ Add</v-chip>
          </div>
          <div class="d-flex align-center">
            <v-icon>mdi-information-outline</v-icon>
            <v-subheader>Info</v-subheader>
          </div>
          <div class="px-2 pt-2 d-flex align-center">
            <v-subheader>Video duration</v-subheader>
            {{ videoDuration }}
          </div>
          <div class="px-2 d-flex align-center">
            <v-subheader>Video dimensions</v-subheader>
            {{ currentScene.meta.dimensions.width }}x{{ currentScene.meta.dimensions.height }}
          </div>
          <div class="px-2 pb-2 d-flex align-center">
            <v-subheader>Video size</v-subheader>
            {{ (currentScene.meta.size /1000/ 1000).toFixed(0) }} MB
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div class="headline text-center">Starring</div>

          <v-row>
            <v-col
              v-for="actor in actors"
              :key="actor.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <actor-card
                @rate="rateActor(actor.id, $event)"
                @bookmark="bookmarkActor(actor.id, $event)"
                @favorite="favoriteActor(actor.id, $event)"
                style="height: 100%"
                :actor="actor"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div v-if="currentScene.images.length">
        <div class="headline text-center">Images</div>
        <v-container fluid>
          <v-row>
            <v-col v-for="image in currentScene.images" :key="image.id" cols="6" sm="4">
              <v-img
                eager
                :src="imageLink(image)"
                class="image"
                :alt="image.name"
                :title="image.name"
                width="100%"
                height="100%"
              >
                <div class="corner-actions">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        @click="setAsThumbnail(image.id)"
                        v-on="on"
                        class="elevation-2 mb-2"
                        icon
                        style="background: #fafafa;"
                      >
                        <v-icon color="black">mdi-image</v-icon>
                      </v-btn>
                    </template>
                    <span>Set as scene thumbnail</span>
                  </v-tooltip>
                </div>
              </v-img>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
    <div v-else class="text-center">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <v-dialog scrollable v-model="labelSelectorDialog" max-width="400px">
      <v-card :loading="labelEditLoader" v-if="currentScene">
        <v-card-title>Select labels for '{{ currentScene.name }}'</v-card-title>

        <v-card-text style="height: 400px">
          <LabelSelector :items="allLabels" v-model="selectedLabels" />
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editLabels" depressed color="primary" class="black--text text-none">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import sceneFragment from "../fragments/scene";
import { sceneModule } from "../store/scene";
import actorFragment from "../fragments/actor";
import ActorCard from "../components/ActorCard.vue";
import moment from "moment";
import LabelSelector from "../components/LabelSelector.vue";

@Component({
  components: {
    ActorCard,
    LabelSelector
  },
  beforeRouteLeave(_to, _from, next) {
    sceneModule.setCurrent(null);
    next();
  }
})
export default class SceneDetails extends Vue {
  get currentScene() {
    return sceneModule.current;
  }

  actors = [] as any[];

  labelSelectorDialog = false;
  allLabels = [] as any[];
  selectedLabels = [] as any[];
  labelEditLoader = false;

  setAsThumbnail(id: string) {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            thumbnail {
              id
            }
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          thumbnail: id
        }
      }
    })
      .then(res => {
        sceneModule.setThumbnail(id);
      })
      .catch(err => {
        console.error(err);
      });
  }

  editLabels() {
    this.labelEditLoader = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            labels {
              id
              name
              aliases
            }
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          labels: this.selectedLabels.map(i => this.allLabels[i]).map(l => l.id)
        }
      }
    })
      .then(res => {
        sceneModule.setLabels(res.data.updateScenes[0].labels);
        this.labelSelectorDialog = false;
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.labelEditLoader = false;
      });
  }

  openLabelSelector() {
    if (!this.allLabels.length) {
      ApolloClient.query({
        query: gql`
          {
            getLabels {
              id
              name
              aliases
            }
          }
        `
      })
        .then(res => {
          this.allLabels = res.data.getLabels;
          this.selectedLabels = this.currentScene.labels.map(l =>
            this.allLabels.findIndex(k => k.id == l.id)
          );
          this.labelSelectorDialog = true;
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      this.labelSelectorDialog = true;
    }
  }

  get releaseDate() {
    if (this.currentScene && this.currentScene.releaseDate)
      return new Date(this.currentScene.releaseDate).toDateString();
    return "";
  }

  get videoDuration() {
    if (this.currentScene)
      return moment()
        .startOf("day")
        .seconds(this.currentScene.meta.duration)
        .format("H:mm:ss");
    return "";
  }

  imageLink(image: any) {
    return `${serverBase}/image/${image.id}?password=${localStorage.getItem(
      "password"
    )}`;
  }

  rate($event) {
    const rating = $event * 2;

    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            rating
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          rating
        }
      }
    }).then(res => {
      sceneModule.setRating(rating);
    });
  }

  rateActor(id: any, rating: number) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.rating = rating;
      Vue.set(this.actors, index, actor);
    }
  }

  favoriteActor(id: any, favorite: boolean) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.favorite = favorite;
      Vue.set(this.actors, index, actor);
    }
  }

  bookmarkActor(id: any, bookmark: boolean) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.bookmark = bookmark;
      Vue.set(this.actors, index, actor);
    }
  }

  get labelNames() {
    return this.currentScene.labels.map(l => l.name).sort();
  }

  get thumbnail() {
    if (this.currentScene.thumbnail)
      return `${serverBase}/image/${
        this.currentScene.thumbnail.id
      }?password=${localStorage.getItem("password")}`;
    return "";
  }

  beforeMount() {
    ApolloClient.query({
      query: gql`
        query($id: String!) {
          getSceneById(id: $id) {
            ...SceneFragment
            images {
              id
              name
            }
          }
        }
        ${sceneFragment}
      `,
      variables: {
        id: (<any>this).$route.params.id
      }
    }).then(res => {
      sceneModule.setCurrent(res.data.getSceneById);
      this.actors = res.data.getSceneById.actors;
    });
  }
}
</script>

<style lang="scss" scoped>
.corner-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>