<template>
  <div v-if="currentScene" class="d-flex align-center">
    <v-btn class="mr-1" icon @click="$router.go(-1)">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-toolbar-title class="mr-1 title">{{ currentScene.name }}</v-toolbar-title>

    <!-- TODO: send watch mutation to increment view counter -->
    <v-btn class="mr-1" target="_blank" :href="currentSceneURL" icon>
      <v-icon>mdi-play</v-icon>
    </v-btn>

    <v-btn @click="favorite" class="mr-1" icon>
      <v-icon
        :color="currentScene.favorite ? 'red' : 'black'"
      >{{ currentScene.favorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
    </v-btn>

    <v-btn @click="bookmark" icon>
      <v-icon
        color="black"
      >{{ currentScene.bookmark ? 'mdi-bookmark-check' : 'mdi-bookmark-outline' }}</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { sceneModule } from "../../store/scene";
import ApolloClient, { serverBase } from "../../apollo";
import gql from "graphql-tag";

@Component({
  components: {}
})
export default class App extends Vue {
  favorite() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            favorite
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          favorite: !this.currentScene.favorite
        }
      }
    }).then(res => {
       sceneModule.setFavorite(res.data.updateScenes[0].favorite);
    });
  }

  bookmark() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            bookmark
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          bookmark: !this.currentScene.bookmark
        }
      }
    }).then(res => {
      sceneModule.setBookmark(res.data.updateScenes[0].bookmark);
    });
  }

  get currentScene() {
    return sceneModule.current;
  }

  get currentSceneURL() {
    if (this.currentScene)
      return `${serverBase}/scene/${
        this.currentScene.id
      }?password=${localStorage.getItem("password")}`;
  }
}
</script>