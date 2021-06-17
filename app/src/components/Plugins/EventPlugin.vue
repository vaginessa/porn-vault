<template>
  <v-expansion-panel>
    <v-expansion-panel-header>
      <template #default>
        <v-row no-gutters>
          <v-col cols="12">
            <v-icon :disabled="disableDrag" @click.stop class="plugin-handle">mdi-menu</v-icon>
            {{ value.id }}
          </v-col>
        </v-row>
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
      <v-row>
        <v-col cols="12" sm="6">
          <CodeTextArea
            :value="defaultArgs ? JSON.stringify(defaultArgs) : ''"
            label="default args"
            rows="4"
            placeholder="No default arguments available"
            no-resize
            auto-grow
            readonly
          >
          </CodeTextArea>
        </v-col>
        <v-col cols="12" sm="6">
          <CodeTextArea
            v-model="argsStr"
            @hasValidSyntax="hasValidArgsSyntax = $event"
            @inputObj="args = $event"
            label="args"
            rows="4"
            placeholder="Edit or paste the plugin arguments. Leave empty to use default arguments."
            no-resize
            auto-grow
            clearable
            :errorMessages="hasValidArgs ? [] : ['Invalid arguments for plugin']"
            :hint="
              hasCustomArgs
                ? 'Custom args'
                : args
                ? 'Same as default args'
                : 'No value, will use default args'
            "
            persistent-hint
            :ignoreEmpty="true"
          >
            <template #actions>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click="resetArgs" icon>
                    <v-icon>mdi-reload</v-icon>
                  </v-btn>
                </template>
                <span>Reset to default args</span>
              </v-tooltip>
            </template>
          </CodeTextArea>
        </v-col>
      </v-row>
    </v-expansion-panel-content>

    <v-dialog v-model="confirmDeletion" max-width="400px">
      <v-card>
        <v-card-title>
          Really remove {{ value.id || "(unnamed plugin)" }} from this event ?
        </v-card-title>
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

import CodeTextArea from "@/components/CodeTextArea.vue";
import { EditEventPlugin } from "@/types/plugins";

@Component({
  components: {
    CodeTextArea,
  },
})
export default class EventPlugin extends Vue {
  @Prop() value!: EditEventPlugin;
  @Prop() defaultArgs!: object;
  @Prop() disableDrag!: boolean;

  args: object | null = this.value.args ? JSON.parse(JSON.stringify(this.value.args)) : null;
  argsStr = this.value.args ? JSON.stringify(this.value.args, null, 2) : "";
  hasValidArgs = this.value.hasValidArgs;
  hasValidArgsSyntax = true;
  confirmDeletion = false;

  get hasCustomArgs(): boolean {
    return this.defaultArgs
      ? !!this.args && JSON.stringify(this.args) !== JSON.stringify(this.defaultArgs)
      : !!this.args || this.args !== this.defaultArgs;
  }

  emitValue() {
    const newValue = JSON.parse(JSON.stringify(this.value)) as EditEventPlugin;
    newValue.args = JSON.parse(JSON.stringify(this.args));
    newValue.hasValidArgs = this.hasValidArgs && this.hasValidArgsSyntax;
    newValue.hasCustomArgs = this.hasCustomArgs;

    this.$emit("input", newValue);
  }

  @Watch("args")
  onArgsChange() {
    this.emitValue();
  }

  @Watch("hasValidArgsSyntax")
  onHasValidArgsSyntaxChange() {
    this.emitValue();
  }

  resetArgs() {
    if (this.defaultArgs) {
      this.args = JSON.parse(JSON.stringify(this.defaultArgs));
      this.argsStr = JSON.stringify(this.defaultArgs, null, 2);
    } else {
      this.args = null;
      this.argsStr = "";
    }
  }
}
</script>
