<template>
  <div class="d-flex flex-column pa-2 role='presentation' code-textarea-root">
    <div class="d-flex align-center">
      <span
        @click="changeMode(Mode.JSON)"
        class="hover"
        :class="mode === Mode.JSON ? 'font-weight-black' : ''"
      >
        JSON </span
      >/
      <span
        @click="changeMode(Mode.YAML)"
        class="hover"
        :class="mode === Mode.YAML ? 'font-weight-black' : ''"
      >
        YAML
      </span>
      <v-spacer></v-spacer>
      <v-btn icon @click="copyOutput">
        <v-icon>mdi-content-copy</v-icon>
      </v-btn>
    </div>
    <v-divider class="mb-3 mt-1"></v-divider>
    <v-textarea
      class="code-textarea"
      v-bind="$attrs"
      dense
      flat
      v-model="innerValue"
      :error-messages="mergedErrorMessages"
    ></v-textarea>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import YAML from "yaml";
import { Mode } from "./Code.vue";

@Component({})
export default class CodeTextArea extends Vue {
  @Prop({ default: false }) value!: string;
  @Prop({ default: () => [] }) errorMessages!: string[];

  innerValue = this.value;
  innerValueObj = {};
  mode: Mode | null = null;
  Mode = Mode;

  invalidError = "";
  hasValidSyntax = true;

  cleanAndValidate(outputMode: Mode | null) {
    let value = (this.innerValue || "").replaceAll("---", "");

    const valueObj = this.parseValue(value);
    if (valueObj) {
      this.innerValueObj = valueObj;
      if (!outputMode || outputMode === Mode.JSON) {
        this.innerValue = JSON.stringify(valueObj, null, 2);
      } else if (outputMode === Mode.YAML) {
        this.innerValue = YAML.stringify(valueObj);
      }
    }
  }

  parseValue(value: string): object | null {
    let valueObj: object | null = null;
    let triedType = "";
    this.invalidError = "";
    try {
      if (this.mode === Mode.JSON || (!this.mode && value.includes("{") && value.includes("}"))) {
        triedType = "JSON";
        valueObj = JSON.parse(value);
      } else {
        triedType = "YAML";
        valueObj = YAML.parse(value);
      }
      this.hasValidSyntax = true;
    } catch (err) {
      this.invalidError = `Could not parse as ${triedType}. Please check the syntax.`;
      this.hasValidSyntax = false;
    }
    return valueObj;
  }

  @Watch("value")
  onValueChange() {
    this.innerValue = this.value;
  }

  @Watch("innerValue")
  onInnerValueChange() {
    this.cleanAndValidate(this.mode);
    this.$emit("input", this.innerValue);
    this.$emit("hasValidSyntax", this.hasValidSyntax);
  }

  @Watch("innerValueObj")
  onInnerValueObjChange() {
    this.$emit("inputObj", this.innerValueObj);
  }

  changeMode(mode: Mode): void {
    if (this.hasValidSyntax) {
      // If the content can already be parsed with the current mode,
      // switch the format of the value first
      this.cleanAndValidate(mode);
      this.mode = mode;
    } else {
      // Otherwise, change the mode first so the parse will
      // be in the new mode
      this.mode = mode;
      this.cleanAndValidate(mode);
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.innerValue).then(
      () => {
        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  }

  get mergedErrorMessages() {
    return [...this.errorMessages, ...(this.hasValidSyntax ? [] : [this.invalidError])];
  }

  mounted() {
    this.cleanAndValidate(this.mode);
    this.$emit("input", this.innerValue);
    this.$emit("hasValidSyntax", this.hasValidSyntax);
  }
}
</script>

<style lang="scss" scoped>
.code-textarea-root {
  background: #090909;
  border-radius: 4px;
}
.code-textarea {
  font-family: monospace;
  white-space: pre-line;
}
</style>
