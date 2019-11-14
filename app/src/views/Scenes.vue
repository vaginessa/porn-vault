<template>
  <div>
    <div v-if="!fetchLoader">
      <h1 class="font-weight-light">Scenes</h1>
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
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApolloClient, { serverBase } from "../apollo";
import gql from "graphql-tag";
import SceneCard from "../components/SceneCard.vue";
import sceneFragment from "../fragments/scene";

@Component({
  components: {
    SceneCard
  }
})
export default class SceneList extends Vue {
  scenes = [] as any[];
  fetchLoader = false;

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
          }
        }
        ${sceneFragment}
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