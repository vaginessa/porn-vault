<template>
  <div class="d-flex">
    <div style="width: 100%">
      <v-row dense class="mt-3">
        <v-col cols="12" sm="9">
          <v-text-field
            hide-details
            placeholder="Path"
            solo
            flat
            single-line
            dense
            v-model="path"
          ></v-text-field>
            <!-- :hint="version"
            :persistent-hint="version.length > 0" -->
        </v-col>
        <v-col cols="12" sm="3">
          <div class="d-flex">
            <div style="width: 96%">
              <v-text-field
                hide-details
                placeholder="Identifier"
                solo
                flat
                single-line
                dense
                v-model="id"
              ></v-text-field>
            </div>
            <div style="width: 1%" />
            <div style="width: 4%">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon color="error" v-on="on" @click="$emit('delete')">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
                <span>Remove plugin</span>
              </v-tooltip>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row dense class="mb-3">
        <v-col cols="12" sm="2" />
        <v-col cols="12" sm="8">
          <div class="d-flex pa-2 input">
            <v-textarea
              label="args"
              dense
              flat
              hide-details
              placeholder="Edit or paste the plugin arguments."
              no-resize
              auto-grow
              rows="4"
              v-model="args"
            ></v-textarea>
          </div>
        </v-col>
        <v-col cols="12" sm="2" />
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

interface IPlugin {
  id: string;
  path: string;
  args: string;
//  version: string;
}

@Component({
  components: {},
})
export default class PluginItem extends Vue {
  @Prop() value!: IPlugin;

  readValue() {
    this.id = this.value.id;
    this.path = this.value.path;
    this.args = this.value.args;
//    this.version = this.value.version;
  }

  id = this.value.id;
  path = this.value.path;
  args = this.value.args;
//  version = this.value.version;

  emitValue() {
    const newValue = JSON.parse(JSON.stringify(this.value)) as IPlugin;
    newValue.id = this.id;
    newValue.path = this.path;
    newValue.args = this.args;
//    newValue.version = this.version;
    this.$emit("input", newValue);
  }

  @Watch("id")
  onIdChange() {
    this.emitValue();
  }

  @Watch("path")
  onPathChange() {
    this.emitValue();
  }

  @Watch("args")
  onArgsChange() {
    this.emitValue();
  }
}
</script>

<style lang="scss" scoped>
.input {
  background: #090909;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-line;
}
</style>
