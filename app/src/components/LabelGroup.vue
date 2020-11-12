<template>
  <div>
    <v-chip
      label
      class="mr-1 mb-1"
      small
      outlined
      v-for="label in labels.slice(0, limit)"
      :key="label._id"
      :close="allowRemove"
      @click:close="removeLabel(label._id)"
      close-icon="mdi-close"
    >
      {{ label.name }}
    </v-chip>

    <div class="d-inline-block" v-if="labels.length > limit">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" label class="mr-1 mb-1" small outlined v-if="labels.length > 5"
            >...and more</v-chip
          >
        </template>
        {{
          labels
            .slice(limit, 999)
            .map((l) => l.name)
            .join(", ")
        }}
      </v-tooltip>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ApolloClient from "../apollo";
import gql from "graphql-tag";
import ILabel from "../types/label";
import { copy } from "../util/object";

@Component
export default class LabelGroup extends Vue {
  @Prop({ default: () => [] }) value!: ILabel[];
  @Prop({ type: String, required: true }) item!: string;
  @Prop({ default: true }) allowRemove!: boolean;
  @Prop({ default: 5 }) limit!: number;

  get labels() {
    return this.value.sort((a, b) => a.name.localeCompare(b.name));
  }

  async removeLabel(id: string) {
    try {
      await ApolloClient.mutate({
        mutation: gql`
          mutation($item: String!, $label: String!) {
            removeLabel(item: $item, label: $label)
          }
        `,
        variables: {
          item: this.item,
          label: id,
        },
      });
      this.$emit(
        "input",
        copy(this.value).filter((x) => x._id !== id)
      );
    } catch (error) {}
  }
}
</script>

<style lang="scss" scoped>
</style>