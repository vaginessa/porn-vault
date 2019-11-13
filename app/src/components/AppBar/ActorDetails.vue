<template>
  <div v-if="currentActor" class="d-flex align-center">
    <v-btn class="mr-1" icon @click="$router.go(-1)">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-toolbar-title class="mr-1 title">{{ currentActor.name }}</v-toolbar-title>

    <v-btn @click="favorite" class="mr-1" icon>
      <v-icon
        :color="currentActor.favorite ? 'red' : 'black'"
      >{{ currentActor.favorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
    </v-btn>

    <v-btn @click="bookmark" icon>
      <v-icon
        color="black"
      >{{ currentActor.bookmark ? 'mdi-bookmark-check' : 'mdi-bookmark-outline' }}</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { actorModule } from "../../store/actor";
import ApolloClient, { serverBase } from "../../apollo";
import gql from "graphql-tag";

@Component({
  components: {}
})
export default class App extends Vue {
  favorite() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
          updateActors(ids: $ids, opts: $opts) {
            favorite
          }
        }
      `,
      variables: {
        ids: [this.currentActor.id],
        opts: {
          favorite: !this.currentActor.favorite
        }
      }
    })
      .then(res => {
        actorModule.setFavorite(res.data.updateActors[0].favorite);
      })
      .catch(err => {
        console.error(err);
      });
  }

  bookmark() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
          updateActors(ids: $ids, opts: $opts) {
            bookmark
          }
        }
      `,
      variables: {
        ids: [this.currentActor.id],
        opts: {
          bookmark: !this.currentActor.bookmark
        }
      }
    })
      .then(res => {
        actorModule.setBookmark(res.data.updateActors[0].bookmark);
      })
      .catch(err => {
        console.error(err);
      });
  }

  get currentActor() {
    return actorModule.current;
  }
}
</script>