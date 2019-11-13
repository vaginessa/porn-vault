<template>
  <div>
    <div v-if="!fetchLoader">
      <h1 class="font-weight-light">Labels</h1>

      <v-list-item v-if="selectedLabels.length">
        <v-list-item-content>
          <v-list-item-title>{{ selectedLabels.length }} labels selected</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn @click="deleteLabels" icon>
            <v-icon>mdi-delete-forever</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-list-item @click="createLabel = true" v-ripple>
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Add new label</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item-group v-model="selectedLabels" multiple>
        <v-list-item v-for="label in sortedItems" :key="label.id">
          <template v-slot:default="{ active, toggle }">
            <v-list-item-action>
              <v-checkbox color="accent" v-model="active" @click="toggle"></v-checkbox>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ titleCase(label.name) }}</v-list-item-title>
              <v-list-item-subtitle>{{ labelAliases(label) }}</v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list-item-group>

      <v-dialog v-model="createLabel" max-width="400px">
        <v-card :loading="createLabelLoader">
          <v-card-title>Add new label</v-card-title>

          <v-card-text>
            <v-form v-model="validCreation">
              <v-text-field
                clearable
                color="accent"
                v-model="createLabelName"
                placeholder="Label name"
                :rules="createLabelNameRules"
              ></v-text-field>

              <v-combobox
                v-model="createLabelAliases"
                multiple
                chips
                placeholder="Alias names"
                color="accent"
                clearable
              ></v-combobox>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="addLabel"
              :disabled="!validCreation"
              depressed
              color="primary"
              class="black--text text-none"
            >Add</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-else class="text-center">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApolloClient from "../apollo";
import gql from "graphql-tag";

@Component
export default class Home extends Vue {
  labels = [] as any[];
  fetchLoader = false;

  selectedLabels = [] as number[];

  createLabel = false;
  createLabelLoader = false;
  createLabelName = "";
  createLabelAliases = [];
  validCreation = false;

  createLabelNameRules = [v => (!!v && !!v.length) || "Invalid label name"];

  get selectedLabelsIDs() {
    return this.selectedLabels.map(i => this.labels[i]).map(l => l.id);
  }

  deleteLabels() {
    ApolloClient.mutate({
      mutation: gql`
        mutation($ids: [String!]!) {
          removeLabels(ids: $ids)
        }
      `,
      variables: {
        ids: this.selectedLabelsIDs
      }
    })
      .then(() => {
        for (const id of this.selectedLabelsIDs) {
          this.labels = this.labels.filter(l => l.id != id);
        }
        this.selectedLabels = [];
      })
      .catch(error => {
        console.error(error);
      });
  }

  addLabel() {
    this.createLabelLoader = true;
    ApolloClient.mutate({
      mutation: gql`
        mutation($name: String!, $aliases: [String!]) {
          addLabel(name: $name, aliases: $aliases) {
            id
            name
            aliases
            thumbnail {
              id
            }
          }
        }
      `,
      variables: {
        name: this.createLabelName,
        aliases: this.createLabelAliases
      }
    })
      .then(res => {
        this.labels.push(res.data.addLabel);
        this.createLabel = false;
        this.createLabelName = "";
        this.createLabelAliases = [];
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        this.createLabelLoader = false;
      });
  }

  get sortedItems() {
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }

  labelAliases(label: any) {
    return label.aliases
      .map(l => this.titleCase(l))
      .sort()
      .join(", ");
  }

  titleCase(str: string) {
    return str
      .split(" ")
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(" ");
  }

  beforeMount() {
    this.fetchLoader = true;
    ApolloClient.query({
      query: gql`
        {
          getLabels {
            id
            name
            aliases
            thumbnail {
              id
            }
          }
        }
      `
    })
      .then(res => {
        this.labels = res.data.getLabels;
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
