<template>
  <div>
    <div v-if="!fetchLoader">
      <h1 class="font-weight-light">Actors</h1>
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
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import ActorCard from "../components/ActorCard.vue";
import actorFragment from "../fragments/actor";

@Component({
  components: {
    ActorCard
  }
})
export default class SceneList extends Vue {
  actors = [] as any[];
  fetchLoader = false;

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

  titleCase(str: string) {
    return str
      .split(" ")
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(" ");
  }

  actorLabels(actor: any) {
    return actor.labels.map(l => l.name).sort();
  }

  actorActorNames(actor: any) {
    return actor.actors.map(a => a.name).join(", ");
  }

  actorThumbnail(actor: any) {
    if (actor.thumbnail)
      return `${serverBase}/image/${
        actor.thumbnail.id
      }?pass=${localStorage.getItem("password")}`;
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