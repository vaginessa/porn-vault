<template>
  <div>
    <div color="primary" class="mb-3 text-xs-center">
      <v-btn large @click="createDialog = true">
        <v-icon left>add</v-icon>Add Actor
      </v-btn>
    </div>

    <!-- {{ $store.state.actors.items }} -->

    <v-layout row wrap v-if="items.length">
      <v-flex v-for="actor in items" :key="actor.id" xs6 sm4 md4 lg3>
        <Actor :actor="actor" v-on:open="expand(actor)"></Actor>
      </v-flex>
    </v-layout>

    <v-dialog v-model="createDialog" max-width="600px">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Add actor</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-layout row wrap align-center>
            <v-flex xs6 sm4>
              <v-subheader>Actor name</v-subheader>
            </v-flex>
            <v-text-field single-line v-model="creating.name" label="Enter a name"></v-text-field>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat>Cancel</v-btn>
          <v-btn @click="addActor" outline color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Actor from "@/classes/actor";
import ActorComponent from "@/components/Actor.vue";

export default Vue.extend({
  components: {
    Actor: ActorComponent
  },
  data() {
    return {
      createDialog: false,
      creating: {
        name: ""
      }
    };
  },
  methods: {
    addActor() {
      let actor = Actor.create(this.creating.name);
      this.$store.commit("actors/add", actor);
      this.createDialog = false;
    }
  },
  computed: {
    items(): Actor[] {
      return this.$store.state.actors.items;
    }
  }
});
</script>

<style>
</style>
