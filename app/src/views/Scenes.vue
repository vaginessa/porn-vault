<template>
  <div>
    <h1>Scenes</h1>
    {{ scenes }}
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3">
        <scene-card
          @rate="rate(scene.id, $event)"
          @bookmark="bookmark(scene.id, $event)"
          @favorite="favorite(scene.id, $event)"
          :scene="scene"
          v-for="scene in scenes"
          :key="scene.id"
        />
      </v-col>
    </v-row>
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

  titleCase(str: string) {
    return str
      .split(" ")
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(" ");
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
      }?pass=${localStorage.getItem("password")}`;
    return "";
  }

  beforeMount() {
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
      });
  }
}
</script>