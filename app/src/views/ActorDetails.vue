<template>
  <div>
    <div v-if="currentActor">
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="3" xl="2">
          <v-container>
            <v-img class="elevation-4" aspect-ratio="1" cover :src="thumbnail"></v-img>
          </v-container>
        </v-col>
        <v-col cols="12" sm="8" md="8" lg="9" xl="10">
          <div v-if="currentActor.bornOn">
            <div class="d-flex align-center">
              <v-icon>mdi-calendar</v-icon>
              <v-subheader>Birthday</v-subheader>
            </div>
            <div class="med--text pa-2">{{ bornOn }}</div>
          </div>

          <div class="d-flex align-center">
            <v-icon>mdi-star</v-icon>
            <v-subheader>Rating</v-subheader>
          </div>
          <v-rating
            half-increments
            @input="rate"
            class="pa-2"
            :value="currentActor.rating / 2"
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
              label
              class="mr-1 mb-1"
              small
              outlined
              v-for="label in labelNames"
              :key="label"
            >{{ label }}</v-chip>
            <v-chip color="accent" v-ripple @click="openLabelSelector" small class="mr-1 mb-1">+ Add</v-chip>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="currentActor.scenes.length">
        <v-col cols="12">
          <div class="headline text-center">Scenes</div>

          <v-row>
            <v-col v-for="scene in scenes" :key="scene.id" cols="12" sm="6" md="4" lg="3">
              <scene-card
                @rate="rateScene(scene.id, $event)"
                @bookmark="bookmarkScene(scene.id, $event)"
                @favorite="favoriteScene(scene.id, $event)"
                :scene="scene"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div v-if="currentActor.images.length">
        <div class="headline text-center">Images</div>
        <v-container fluid>
          <v-row>
            <v-col v-for="image in currentActor.images" :key="image.id" cols="6" sm="4">
              <v-img
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
                    <span>Set as actor thumbnail</span>
                  </v-tooltip>
                </div>
              </v-img>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
    <div v-else class="text-center">
      <p>Loading...</p>
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <v-dialog scrollable v-model="labelSelectorDialog" max-width="400px">
      <v-card :loading="labelEditLoader" v-if="currentActor">
        <v-card-title>Select labels for '{{ currentActor.name }}'</v-card-title>

        <v-card-text style="max-height: 400px">
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
import { Component, Vue } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import sceneFragment from "../fragments/scene";
import actorFragment from "../fragments/actor";
import { actorModule } from "../store/actor";
import SceneCard from "../components/SceneCard.vue";
import moment from "moment";
import LabelSelector from "../components/LabelSelector.vue";

@Component({
  components: {
    SceneCard,
    LabelSelector
  },
  beforeRouteLeave(_to, _from, next) {
    actorModule.setCurrent(null);
    next();
  }
})
export default class ActorDetails extends Vue {
  scenes = [] as any[];

  labelSelectorDialog = false;
  allLabels = [] as any[];
  selectedLabels = [] as any[];
  labelEditLoader = false;

  get currentActor() {
    return actorModule.current;
  }

  setAsThumbnail(id: string) {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
          updateActors(ids: $ids, opts: $opts) {
            thumbnail {
              id
            }
          }
        }
      `,
      variables: {
        ids: [this.currentActor.id],
        opts: {
          thumbnail: id
        }
      }
    })
      .then(res => {
        actorModule.setThumbnail(id);
      })
      .catch(err => {
        console.error(err);
      });
  }

  editLabels() {
    this.labelEditLoader = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
          updateActors(ids: $ids, opts: $opts) {
            labels {
              id
              name
              aliases
            }
          }
        }
      `,
      variables: {
        ids: [this.currentActor.id],
        opts: {
          labels: this.selectedLabels.map(i => this.allLabels[i]).map(l => l.id)
        }
      }
    })
      .then(res => {
        actorModule.setLabels(res.data.updateActors[0].labels);
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
          this.selectedLabels = this.currentActor.labels.map(l =>
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

  imageLink(image: any) {
    return `${serverBase}/image/${image.id}?password=${localStorage.getItem(
      "password"
    )}`;
  }

  rate($event) {
    const rating = $event * 2;

    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
          updateActors(ids: $ids, opts: $opts) {
            rating
          }
        }
      `,
      variables: {
        ids: [this.currentActor.id],
        opts: {
          rating
        }
      }
    }).then(res => {
      actorModule.setRating(rating);
    });
  }

  get labelNames() {
    return this.currentActor.labels.map(l => l.name).sort();
  }

  get thumbnail() {
    if (this.currentActor.thumbnail)
      return `${serverBase}/image/${
        this.currentActor.thumbnail.id
      }?password=${localStorage.getItem("password")}`;
    return "";
  }

  rateScene(id: any, rating: number) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.scenes[index];
      actor.rating = rating;
      Vue.set(this.scenes, index, actor);
    }
  }

  favoriteScene(id: any, favorite: boolean) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.scenes[index];
      actor.favorite = favorite;
      Vue.set(this.scenes, index, actor);
    }
  }

  bookmarkScene(id: any, bookmark: boolean) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.scenes[index];
      actor.bookmark = bookmark;
      Vue.set(this.scenes, index, actor);
    }
  }

  beforeMount() {
    ApolloClient.query({
      query: gql`
        query($id: String!) {
          getActorById(id: $id) {
            ...ActorFragment
            scenes {
              ...SceneFragment
            }
            images {
              id
              name
            }
          }
        }
        ${actorFragment}
        ${sceneFragment}
      `,
      variables: {
        id: (<any>this).$route.params.id
      }
    }).then(res => {
      actorModule.setCurrent(res.data.getActorById);
      this.scenes = res.data.getActorById.scenes;
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