<template>
  <div>
    <div v-if="!fetchLoader">
      <div class="d-flex align-center">
        <h1 class="font-weight-light mr-3">Actors</h1>
        <v-btn @click="openCreateDialog" icon>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <v-row>
        <v-col v-for="actor in actors" :key="actor.id" cols="12" sm="6" md="4" lg="3">
          <actor-card
            @rate="rate(actor.id, $event)"
            @bookmark="bookmark(actor.id, $event)"
            @favorite="favorite(actor.id, $event)"
            :actor="actor"
            style="height: 100%"
          />
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center">
      <p>Loading...</p>
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <v-dialog v-model="createActorDialog" max-width="400px">
      <v-card :loading="addActorLoader">
        <v-card-title>Add new actor/actress</v-card-title>
        <v-card-text>
          <v-form v-model="validCreation">
            <v-text-field
              :rules="actorNameRules"
              color="accent"
              v-model="createActorName"
              placeholder="Name"
            />

            <v-combobox
              color="accent"
              multiple
              chips
              v-model="createActorAliases"
              placeholder="Alias names"
            />

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
            @click="addActor"
          >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog scrollable v-model="labelSelectorDialog" max-width="400px">
      <v-card>
        <v-card-title>Select labels for '{{ createActorName }}'</v-card-title>

        <v-card-text style="height: 400px">
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
import ActorCard from "../components/ActorCard.vue";
import LabelSelector from "../components/LabelSelector.vue";
import actorFragment from "../fragments/actor";

@Component({
  components: {
    ActorCard,
    LabelSelector
  }
})
export default class SceneList extends Vue {
  actors = [] as any[];
  fetchLoader = false;

  validCreation = false;
  createActorDialog = false;
  createActorName = "";
  createActorAliases = [] as string[];
  allLabels = [] as any[];
  selectedLabels = [] as number[];
  labelSelectorDialog = false;
  addActorLoader = false;

  actorNameRules = [v => (!!v && !!v.length) || "Invalid actor name"];

  addActor() {
    this.addActorLoader = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($name: String!, $aliases: [String!], $labels: [String!]) {
          addActor(name: $name, aliases: $aliases, labels: $labels) {
            ...ActorFragment
          }
        }
        ${actorFragment}
      `,
      variables: {
        name: this.createActorName,
        aliases: this.createActorAliases,
        labels: this.selectedLabelsIDs
      }
    })
      .then(res => {
        this.actors.unshift(res.data.addActor);
        this.createActorDialog = false;
        this.createActorName = "";
        this.createActorAliases = [];
        this.selectedLabels = [];
      })
      .catch(() => {})
      .finally(() => {
        this.addActorLoader = false;
      });
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

  get selectedLabelsIDs() {
    return this.selectedLabels.map(i => this.allLabels[i]).map(l => l.id);
  }

  get selectedLabelNames() {
    return this.selectedLabels.map(i => this.allLabels[i].name);
  }

  openCreateDialog() {
    this.createActorDialog = true;
  }

  rate(id: any, rating: number) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.rating = rating;
      Vue.set(this.actors, index, actor);
    }
  }

  favorite(id: any, favorite: boolean) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.favorite = favorite;
      Vue.set(this.actors, index, actor);
    }
  }

  bookmark(id: any, bookmark: boolean) {
    const index = this.actors.findIndex(sc => sc.id == id);

    if (index > -1) {
      const actor = this.actors[index];
      actor.bookmark = bookmark;
      Vue.set(this.actors, index, actor);
    }
  }

  actorLabels(actor: any) {
    return actor.labels.map(l => l.name);
  }

  actorActorNames(actor: any) {
    return actor.actors.map(a => a.name).join(", ");
  }

  actorThumbnail(actor: any) {
    if (actor.thumbnail)
      return `${serverBase}/image/${
        actor.thumbnail.id
      }?password=${localStorage.getItem("password")}`;
    return "";
  }

  beforeMount() {
    this.fetchLoader = true;
    ApolloClient.query({
      query: gql`
        {
          getActors {
            ...ActorFragment
          }
        }
        ${actorFragment}
      `
    })
      .then(res => {
        this.actors = res.data.getActors;
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