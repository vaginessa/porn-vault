<template>
  <div style="width:100%" v-if="currentScene" class="d-flex align-center">
    <v-btn color="black" class="mr-1" icon @click="$router.go(-1)">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-toolbar-title class="mr-1 title">{{ currentScene.name }}</v-toolbar-title>

    <!-- TODO: send watch mutation to increment view counter -->
    <v-btn color="black" class="mr-1" target="_blank" :href="currentSceneURL" icon>
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

    <v-spacer></v-spacer>

    <v-btn icon @click="openEditDialog">
      <v-icon color="black">mdi-pencil</v-icon>
    </v-btn>

    <v-btn disabled icon>
      <v-icon color="black">mdi-delete-forever</v-icon>
    </v-btn>

    <v-dialog v-model="editDialog" max-width="400px">
      <v-card>
        <v-card-title>Edit '{{ currentScene.name }}'</v-card-title>
        <v-card-text>
          <v-form v-model="validEdit">
            <v-text-field
              :rules="sceneNameRules"
              color="accent"
              v-model="editName"
              placeholder="Name"
            />

            <v-textarea
              auto-grow
              color="accent"
              v-model="editDescription"
              placeholder="Scene description"
              :rows="2"
            />
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            @click="editScene"
            color="primary"
            class="black--text"
            :disabled="!validEdit"
          >Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  editDialog = false;
  validEdit = false;
  editName = "";
  editDescription = "";

  sceneNameRules = [v => (!!v && !!v.length) || "Invalid scene name"];

  editScene() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
          updateScenes(ids: $ids, opts: $opts) {
            name
            description
          }
        }
      `,
      variables: {
        ids: [this.currentScene.id],
        opts: {
          name: this.editName,
          description: this.editDescription
        }
      }
    })
      .then(res => {
        sceneModule.setName(this.editName);
        sceneModule.setDescription(this.editDescription);
        this.editDialog = false;
      })
      .catch(err => {
        console.error(err);
      });
  }

  openEditDialog() {
    this.editName = this.currentScene.name;
    this.editDialog = true;
  }

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