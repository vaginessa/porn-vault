<template>
  <div>
    <div v-if="scene">
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="3" xl="2">
          <v-container>
            <v-img class="elevation-4" aspect-ratio="1" cover :src="thumbnail"></v-img>
          </v-container>
        </v-col>
        <v-col cols="12" sm="8" md="8" lg="9" xl="10">
          <div class="d-flex align-center">
            <v-icon>mdi-text</v-icon>
            <v-subheader>Description</v-subheader>
          </div>
          <div class="pa-2 med--text" v-if="scene.description">{{ scene.description }}</div>
          <div class="d-flex align-center">
            <v-icon>mdi-star</v-icon>
            <v-subheader>Rating</v-subheader>
          </div>
          <v-rating
            half-increments
            @input="rate"
            class="pa-2"
            :value="scene.rating / 2"
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
            >{{ titleCase(label) }}</v-chip>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div class="headline text-center">Starring</div>

          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3">
              <actor-card :actor="actor" v-for="actor in scene.actors" :key="actor.id" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div v-if="scene.images.length">
        <div class="headline text-center">Images</div>
        <v-container fluid>
          <v-row>
            <v-col v-for="image in scene.images" :key="image.id" cols="6" sm="4">
              <img
                :src="imageLink(image)"
                class="image"
                :alt="image.name"
                :title="image.name"
                width="100%"
                height="100%"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
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
import sceneFragment from "../fragments/scene";
import { sceneModule } from "../store/scene";
import actorFragment from "../fragments/actor";
import ActorCard from "../components/ActorCard.vue";

@Component({
  components: {
    ActorCard
  }
})
export default class Home extends Vue {
  scene = null as any;

  imageLink(image: any) {
    return `${serverBase}/image/${image.id}?pass=${localStorage.getItem(
      "password"
    )}`;
  }

  titleCase(str: string) {
    return str
      .split(" ")
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(" ");
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
        ids: [this.scene.id],
        opts: {
          rating
        }
      }
    }).then(res => {
      this.scene.rating = res.data.updateScenes[0].rating;
    });
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
        ids: [this.scene.id],
        opts: {
          favorite: !this.scene.favorite
        }
      }
    }).then(res => {
      this.scene.favorite = res.data.updateScenes[0].favorite;
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
        ids: [this.scene.id],
        opts: {
          bookmark: !this.scene.bookmark
        }
      }
    }).then(res => {
      this.scene.bookmark = res.data.updateScenes[0].bookmark;
    });
  }

  get labelNames() {
    return this.scene.labels.map(l => l.name).sort();
  }

  get thumbnail() {
    if (this.scene.thumbnail)
      return `${serverBase}/image/${
        this.scene.thumbnail.id
      }?pass=${localStorage.getItem("password")}`;
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
        id: this.$route.params.id
      }
    }).then(res => {
      this.scene = res.data.getSceneById;
      sceneModule.setCurrent(res.data.getSceneById);
    });
  }
}
</script>
