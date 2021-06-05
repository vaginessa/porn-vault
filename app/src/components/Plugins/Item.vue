<template>
  <v-expansion-panel>
    <v-expansion-panel-header>
      <template #default="{ open }">
        <v-hover v-slot:default="{ hover }">
          <v-row dense class="mt-3">
            <v-col cols="12" sm="3">
              <v-text-field
                @click.stop
                label="Identifier"
                placeholder="Enter a name for the plugin"
                flat
                dense
                v-model="id"
                :clearable="open"
                :rules="[(val) => (!!val && !!val.trim()) || 'Required']"
                :error-messages="errorMessages"
                :hint="hint"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-fade-transition>
              <v-col cols="12" sm="9" v-show="open">
                <FileBrowserField
                  @click.stop
                  label="Path"
                  placeholder="Enter the path to the plugin file (.js file)"
                  flat
                  dense
                  v-model="path"
                  clearable
                  :rules="[(val) => (!!val && !!val.trim()) || 'Required']"
                  :extensions="['.js', '.ts']"
                  :defaultBrowsePath="path"
                >
                </FileBrowserField>
              </v-col>
            </v-fade-transition>
          </v-row>
        </v-hover>
      </template>
      <template #actions>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon small color="error" v-on="on" @click.stop="confirmDeletion = true">
              <v-icon color="error">mdi-close</v-icon>
            </v-btn>
          </template>
          <span>Remove plugin</span>
        </v-tooltip>
        <v-icon> $expand </v-icon>
      </template>
    </v-expansion-panel-header>

    <v-expansion-panel-content>
      <v-row dense>
        <v-col cols="12">
          <div class="d-flex flex-column pa-2 role='presentation' args-input-wrapper">
            <div class="d-flex align-center">
              <span
                @click="changeMode(Mode.JSON)"
                class="hover"
                :class="mode === Mode.JSON ? 'font-weight-black' : ''"
                >JSON</span
              >/
              <span
                @click="changeMode(Mode.YAML)"
                class="hover"
                :class="mode === Mode.YAML ? 'font-weight-black' : ''"
                >YAML</span
              >
              <v-spacer></v-spacer>
              <v-btn icon @click="copyOutput">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </div>
            <v-divider class="mb-3 mt-1"></v-divider>
            <v-textarea
              class="args-input"
              label="args"
              dense
              flat
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
      <v-row dense class="mb-3">
        <v-col cols="12" sm="6" v-if="value.authors.length">
          <div class="d-flex align-center">
            <v-icon>mdi-account-group</v-icon>
            <v-subheader>Authors</v-subheader>
          </div>
          <div class="pa-2 med--text">
            {{ value.authors.join(", ") }}
          </div>
        </v-col>

        <v-col cols="12" sm="6" v-if="value.description">
          <div class="d-flex align-center">
            <v-icon>mdi-text</v-icon>
            <v-subheader>Description</v-subheader>
          </div>
          <div class="pa-2 med--text">
            {{ value.description }}
          </div>
        </v-col>
      </v-row>
    </v-expansion-panel-content>

    <v-dialog v-model="confirmDeletion" max-width="400px">
      <v-card>
        <v-card-title>Really delete {{ value.id || "(unnamed plugin)" }} ?</v-card-title>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDeletion = false" text class="text-none">Cancel</v-btn>
          <v-btn @click="$emit('delete')" text color="error" class="text-none">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import FileBrowserField from "@/components/FileBrowserField.vue";
import { Mode } from "@/components/Code.vue";
import YAML from "yaml";

interface IPlugin {
  id: string;
  path: string;
  args: string;
  hasValidArgs: boolean;
  version: string;
  events: string[];
  authors: string[];
  description: string;
}

@Component({
  components: {
    FileBrowserField,
  },
})
export default class PluginItem extends Vue {
  @Prop() value!: IPlugin;
  @Prop() hasConflictingId!: boolean;

  id = this.value.id;
  path = this.value.path;
  args = this.value.args;
  hasValidArgs = this.value.hasValidArgs;
  version = this.value.version;
  invalidError = "";

  mode: Mode | null = null;
  Mode = Mode;

  confirmDeletion = false;

  get hint() {
    const meta = [this.value.version, this.value.events.join(", ")].filter(Boolean).join(" - ");
    return meta || "No metadata available";
  }

  get errorMessages() {
    if (this.hasConflictingId) {
      return ["Conflicting id"];
    }

    return [];
  }

  cleanAndValidate(mode: Mode | null) {
    let args = this.args;

    const argsObj = this.parseArgs(args);
    if (argsObj) {
      if (!mode || mode === Mode.JSON) {
        this.args = JSON.stringify(argsObj, null, 2);
      } else if (mode === Mode.YAML) {
        this.args = YAML.stringify(argsObj);
      }
    }
  }

  parseArgs(args: string): object | null {
    let argsObj: object | null = null;
    let triedType = "JSON or YAML";
    try {
      if (this.mode === Mode.JSON || (!this.mode && args.includes("{") && args.includes("}"))) {
        triedType = "JSON";
        argsObj = JSON.parse(args);
      } else if (this.mode === Mode.YAML) {
        triedType = "YAML";
        argsObj = YAML.parse(args);
      }
      this.hasValidArgs = true;
    } catch (err) {
      this.invalidError = `Could not parse as ${triedType}. Please check the syntax.`;
      this.hasValidArgs = false;
    }
    return argsObj;
  }

  mounted() {
    this.cleanAndValidate(this.mode);
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
    this.cleanAndValidate(this.mode);
    this.emitValue();
  }

  changeMode(mode: Mode): void {
    // Switch the format of the current args before changing the mode
    this.cleanAndValidate(mode);
    this.mode = mode;
  }

  copyOutput() {
    navigator.clipboard.writeText(this.args).then(
      () => {
        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  }
}
</script>

<style lang="scss" scoped>
.args-input-wrapper {
  background: #090909;
  border-radius: 4px;
}
.args-input {
  font-family: monospace;
  white-space: pre-line;
}
</style>
