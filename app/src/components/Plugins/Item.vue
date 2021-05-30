<template>
  <div class="d-flex">
    <div style="width: 100%">
      <v-row dense class="mt-3">
        <v-col cols="12" sm="3">
          <v-text-field
            hide-details
            label="Identifier"
            placeholder="Enter a name for the plugin"
            flat
            dense
            v-model="id"
            clearable
          ></v-text-field>
          <!-- TODO: add version as hint/persistent hint -->
        </v-col>
        <v-col cols="12" sm="9">
          <div class="d-flex">
            <div style="width: 100%">
              <v-text-field
                hide-details
                label="Path"
                placeholder="Enter the path to the plugin file (.js file)"
                flat
                dense
                v-model="path"
                clearable
              ></v-text-field>
            </div>
            <div class="pl-3">
              <!-- TODO: confirm deletion -->
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
        <v-col cols="12">
          <div class="d-flex pa-2 args-input role='presentation'">
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
              :error-messages="hasValidArgs ? [] : [invalidError]"
              clearable
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
  hasValidArgs: boolean;
  version: string;
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
    this.hasValidArgs = this.value.hasValidArgs;
    this.version = this.value.version;
  }

  id = this.value.id;
  path = this.value.path;
  args = this.value.args;
  hasValidArgs = this.value.hasValidArgs;
  version = this.value.version;
  invalidError = "";

  argsCheckRegex = /^\W*["']{0,1}args["']{0,1}[: ]+/im;

  cleanAndValidate() {
    // In case the args include the prefix "args", remove it to keep only the actual args.
    const hasDirtyArgs = this.argsCheckRegex.test(this.args);
    let args = this.args;
    if (hasDirtyArgs) {
      args = args.replace(this.argsCheckRegex, "");
    }

    const valid = this.parseArgs(args);
    if (valid) {
      // if (this.mode === "json") {
      this.args = JSON.stringify(valid, null, 2);
      // } else {
      //   return YAML.stringify(valid);
      // }
    }
  }

  parseArgs(args: string): object | undefined {
    let obj: object | undefined;
    try {
      // if (this.mode === "json") {
      obj = JSON.parse(args);
      // } else {
      //   obj = YAML.parse(args);
      // }
      this.hasValidArgs = true;
      return obj;
    } catch (err) {
      this.invalidError = err;
      this.hasValidArgs = false;
    }
  }

  emitValue() {
    const newValue = JSON.parse(JSON.stringify(this.value)) as IPlugin;
    newValue.id = this.id;
    newValue.path = this.path;
    newValue.args = this.args;
    newValue.hasValidArgs = this.hasValidArgs;
    newValue.version = this.version;
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
    this.cleanAndValidate();
    this.emitValue();
  }
}
</script>

<style lang="scss" scoped>
.args-input {
  background: #090909;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-line;
}
</style>
