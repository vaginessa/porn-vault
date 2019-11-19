<template>
  <div>
    <div v-if="!fetchLoader">
      <div class="d-flex align-center">
        <h1 class="font-weight-light">Scenes</h1>
        <v-btn @click="openCreateDialog" icon>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <v-row>
        <v-col v-for="scene in scenes" :key="scene.id" cols="12" sm="6" md="4" lg="3">
          <scene-card
            @rate="rate(scene.id, $event)"
            @bookmark="bookmark(scene.id, $event)"
            @favorite="favorite(scene.id, $event)"
            :scene="scene"
            style="height: 100%"
          />
        </v-col>
      </v-row>
    </div>
    <div v-else class="text-center">
      <p>Loading...</p>
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <v-dialog v-model="createSceneDialog" max-width="400px">
      <v-card :loading="addSceneLoader">
        <v-card-title>Add new scene</v-card-title>
        <v-card-text>
          <v-form v-model="validCreation">
            <v-text-field
              :rules="sceneNameRules"
              color="accent"
              v-model="createSceneName"
              placeholder="Name"
            />

            <!-- <v-combobox
              color="accent"
              multiple
              chips
              v-model="createSceneActors"
              placeholder="Select actors"
            />-->

            <v-chip
              @click:close="selectedLabels.splice(i, 1)"
              class="mr-1 mb-1"
              close
              small
              outlined
              v-for="(name, i) in selectedLabelNames"
              :key="name"
            >{{ name }}</v-chip>
            <v-chip
              class="mr-1 mb-1"
              @click="openLabelSelectorDialog"
              color="accent"
              dark
              small
            >+ Select labels</v-chip>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            class="black--text text-none"
            :disabled="!validCreation"
            color="primary"
            @click="addScene"
          >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog scrollable v-model="labelSelectorDialog" max-width="400px">
      <v-card>
        <v-card-title>Select labels for '{{ createSceneName }}'</v-card-title>

        <v-card-text style="max-height: 400px">
          <LabelSelector :items="allLabels" v-model="selectedLabels" />
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="labelSelectorDialog = false"
            depressed
            color="primary"
            class="black--text text-none"
          >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import SceneCard from "../components/SceneCard.vue";
import sceneFragment from "../fragments/scene";
import actorFragment from "../fragments/actor";
import LabelSelector from "../components/LabelSelector.vue";

@Component({
  components: {
    SceneCard,
    LabelSelector
  }
})
export default class SceneList extends Vue {
  scenes = [] as any[];
  fetchLoader = false;

  validCreation = false;
  createSceneDialog = false;
  createSceneName = "";
  // createSceneActors = [] as string[];
  allLabels = [] as any[];
  selectedLabels = [] as number[];
  labelSelectorDialog = false;
  addSceneLoader = false;

  sceneNameRules = [v => (!!v && !!v.length) || "Invalid scene name"];

  get selectedLabelsIDs() {
    return this.selectedLabels.map(i => this.allLabels[i]).map(l => l.id);
  }

  get selectedLabelNames() {
    return this.selectedLabels.map(i => this.allLabels[i].name);
  }

  openLabelSelectorDialog() {
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
          this.labelSelectorDialog = true;
        })
        .catch(err => {
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
        mutation($name: String!, $aliases: [String!], $labels: [String!]) {
          addScene(name: $name, aliases: $aliases, labels: $labels) {
            ...SceneFragment
          }
        }
        ${sceneFragment}
      `,
      variables: {
        name: this.createSceneName,
        // actors: this.createSceneActors,
        labels: this.selectedLabelsIDs
      }
    })
      .then(res => {
        this.scenes.unshift(res.data.addScene);
        this.createSceneDialog = false;
        this.createSceneName = "";
        // this.createSceneActors = [];
        this.selectedLabels = [];
      })
      .catch(() => {})
      .finally(() => {
        this.addSceneLoader = false;
      });
  }

  openCreateDialog() {
    this.createSceneDialog = true;
  }

  rate(id: any, rating: number) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const scene = this.scenes[index];
      scene.rating = rating;
      Vue.set(this.scenes, index, scene);
    }
  }

  favorite(id: any, favorite: boolean) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const scene = this.scenes[index];
      scene.favorite = favorite;
      Vue.set(this.scenes, index, scene);
    }
  }

  bookmark(id: any, bookmark: boolean) {
    const index = this.scenes.findIndex(sc => sc.id == id);

    if (index > -1) {
      const scene = this.scenes[index];
      scene.bookmark = bookmark;
      Vue.set(this.scenes, index, scene);
    }
  }

  sceneLabels(scene: any) {
    return scene.labels.map(l => l.name).sort();
  }

  sceneActorNames(scene: any) {
    return scene.actors.map(a => a.name).join(", ");
  }

  sceneThumbnail(scene: any) {
    if (scene.thumbnail)
      return `${serverBase}/image/${
        scene.thumbnail.id
      }?password=${localStorage.getItem("password")}`;
    return "";
  }

  beforeMount() {
    this.fetchLoader = true;
    ApolloClient.query({
      query: gql`
        {
          getScenes {
            ...SceneFragment
            actors {
              ...ActorFragment
            }
          }
        }
        ${sceneFragment}
        ${actorFragment}
      `
    })
      .then(res => {
        this.scenes = res.data.getScenes;
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