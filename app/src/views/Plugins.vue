<template>
  <v-container>
    <BindFavicon />

    <div class="d-flex mb-3 align-center">
      <!-- Icon toolbar and alert messages -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="savePlugin" icon>
            <v-icon>mdi-cog-transfer</v-icon>
          </v-btn>
        </template>
        <span>Save settings</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="reload" icon>
            <v-icon>mdi-reload-alert</v-icon>
          </v-btn>
        </template>
        <span>Discard changes and reload</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <span
        @click="
          mode = 'json';
          compileOutput();
        "
        class="hover"
        :class="mode == 'json' ? 'font-weight-black' : ''"
        >JSON</span
      >/
      <span
        @click="
          mode = 'yaml';
          compileOutput();
        "
        class="hover"
        :class="mode == 'yaml' ? 'font-weight-black' : ''"
        >YAML</span
      >
    </div>
    <v-alert class="mb-3" v-if="hasConflictingIds" dense type="error"
      >Empty or conflicting plugin IDs</v-alert
    >
    <v-alert class="mb-3" v-if="unknownPlugins.length" dense type="error"
      >Unknown plugin(s): {{ unknownPlugins.join(", ") }}</v-alert
    >
    <v-alert class="mb-3 black--text" v-if="unusedPlugins.length" dense type="warning"
      >Unused plugin(s): {{ unusedPlugins.join(", ") }}</v-alert
    >

    <!-- Events mapping -->
    <div><v-icon class="pr-2 mb-1">mdi-launch</v-icon>Events</div>
    <div class="d-flex mb-3">
      <div style="width: 100%" class="mb-3">
        <v-row v-for="(eventsRow, i) in eventsChunked" :key="`eventsRow${i}`" dense>
          <v-col
            cols="12"
            :sm="12 / eventsCols"
            v-for="event in eventsRow"
            :key="event.key"
            class="pl-3 pr-3"
          >
            <!-- TODO: filter plugins by event type to show only the matching one for a given event -->
            <v-select
              class="mb-0 mt-0"
              chips
              dense
              placeholder="Select plugins in the order you want to run them..."
              persistent-hint
              :hint="event.key"
              :items="plugins.map((i) => i.id)"
              clearable
              v-model="event.val"
              multiple
            ></v-select>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Plugins registration -->
    <div v-if="plugins.length">
      <v-icon class="pr-2 mb-1">mdi-toy-brick-outline</v-icon>Plugins
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" @click="addPlugin" icon class="mb-1">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Add plugin</span>
      </v-tooltip>
    </div>
    <Plugin
      @delete="removePlugin(i)"
      class="mb-3"
      v-model="plugins[i]"
      v-for="(plugin, i) in plugins"
      :key="plugin.iid"
    />

    <!-- Global settings -->
    <div><v-icon class="pr-2 mb-1">mdi-tune</v-icon>Global plugin settings</div>
    <div class="d-flex mb-3">
      <div style="width: 100%">
        <v-row
          v-for="(globalSettingsRow, i) in globalSettingsChunked"
          :key="`globalSettingsRow${i}`"
        >
          <v-col
            cols="12"
            :sm="12 / globalSettingsCols"
            v-for="globalSetting in globalSettingsRow"
            :key="globalSetting.key"
          >
            <v-switch
              v-if="globalSetting.type === 'boolean'"
              v-model="globalSetting.val"
              flat
              dense
              hide-details
              :label="globalSetting.key"
            ></v-switch>
            <v-text-field
              v-if="globalSetting.type !== 'boolean'"
              v-model="globalSetting.val"
              flat
              dense
              :label="globalSetting.key"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Full assembled config -->
    <div class="text-center">
      <v-btn class="mt-3 text-none" color="primary" text @click="showFullConfig = !showFullConfig"
        >Show full config</v-btn
      >
    </div>
    <div
      style="position: relative"
      class="white--text mt-3 pa-2 output-title"
      v-if="showFullConfig"
    >
      <div class="d-flex align-center">
        Full plugins config
        <v-spacer></v-spacer>
        <v-btn icon @click="copyOutput">
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
      </div>
      <v-divider class="mb-3 mt-1"></v-divider>
      <div v-if="!hasConflictingIds && !unknownPlugins.length" class="white--text mt-3 pa-2 output">
        {{ output }}
      </div>
      <div v-else>Invalid input. See error above.</div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Plugin from "@/components/Plugins/Item.vue";
import YAML from "yaml";

interface IPlugin {
  id: string;
  iid: string;
  path: string;
  args: string;
  hasValidArgs:  boolean;
  version: string;
  //events: string[];
}

interface ISettingItem {
  key: string;
  type: string;
  val: boolean | string | number | string[];
}

@Component({
  components: {
    Plugin,
  },
})
export default class PluginPage extends Vue {
  plugins = [] as IPlugin[];

  counter = 0;

  mode = "json" as "json" | "yaml";

  output = "";

  showFullConfig = false;

  eventsCols = 2;
  eventsChunked = [] as object[];

  globalSettingsCols = 4;
  globalSettingsChunked = [] as object[];

  async beforeMount() {
    await this.onLoad();
  }

  async onLoad() {
    this.plugins = await this.loadPlugins();
    this.eventsChunked = this.chunk(await this.loadEvents(), this.eventsCols);
    this.globalSettingsChunked = this.chunk(
      await this.loadGlobalSettings(),
      this.globalSettingsCols
    );
    this.compileOutput();
  }

  async reload() {
    // TODO: add warning alert
    this.onLoad();
  }

  async loadPlugins(): Promise<IPlugin[]> {
    // TODO: replace with API response
    const plugins = [
      { iid: "1", id: "fileparser", path: "/plugins/dist/fileparser.js", args: "{}" } as IPlugin,
      {
        iid: "2",
        id: "PromisedScene",
        path: "/plugins/dist/PromisedScene.js",
        args: "{}",
        version: "1.2.0"
      } as IPlugin,
    ] as IPlugin[];

    this.counter = 2;

    return plugins;
  }

  async validatePluginExist(path: string): Promise<IPlugin> {
    // TODO: replace with API response
    return {
      id: "fileorganizer",
      path: "/plugins/dist/fileorganizer.js",
      args: "{ sample args }",
    } as IPlugin;
  }

  async loadEvents(): Promise<ISettingItem[]> {
    // TODO: Load events into events (and clears the not returned content)
    return [
      { key: "actorCreated", type: "string[]", val: [] } as ISettingItem,
      { key: "actorCustom", type: "string[]", val: [] } as ISettingItem,
      { key: "movieCreated", type: "string[]", val: [] } as ISettingItem,
      { key: "movieCustom", type: "string[]", val: [] } as ISettingItem,
      {
        key: "sceneCreated",
        type: "string[]",
        val: ["fileparser", "PromisedScene"],
      } as ISettingItem,
      { key: "sceneCustom", type: "string[]", val: [] } as ISettingItem,
      { key: "studioCreated", type: "string[]", val: [] } as ISettingItem,
      { key: "studioCustom", type: "string[]", val: [] } as ISettingItem,
    ];
  }

  async loadGlobalSettings(): Promise<ISettingItem[]> {
    // TODO: replace with API response
    return [
      { key: "allowSceneThumbnailOverwrite", type: "boolean", val: true } as ISettingItem,
      { key: "allowActorThumbnailOverwrite", type: "boolean", val: true } as ISettingItem,
      { key: "allowMovieThumbnailOverwrite", type: "boolean", val: true } as ISettingItem,
      { key: "allowStudioThumbnailOverwrite", type: "boolean", val: false } as ISettingItem,
      { key: "createMissingActors", type: "boolean", val: true } as ISettingItem,
      { key: "createMissingStudios", type: "boolean", val: true } as ISettingItem,
      { key: "createMissingLabels", type: "boolean", val: true } as ISettingItem,
      { key: "createMissingMovies", type: "boolean", val: true } as ISettingItem,
      { key: "markerDeduplicationThreshold", type: "number", val: 5 } as ISettingItem,
    ] as ISettingItem[];
  }

  async savePlugin() {
    // TODO: implement
  }

  get unusedPlugins() {
    const pluginNames = [] as string[];
    // for (const pluginName of this.plugins.map((p) => p.id)) {
    //   let used = false;
    //   for (const eventName in this.events.keys) {
    //     for (const usedPluginName of this.events[eventName]) {
    //       if (usedPluginName == pluginName) used = true;
    //     }
    //   }
    //   if (!used) pluginNames.push(pluginName);
    // }
    return pluginNames;
  }

  get unknownPlugins() {
    const pluginNames = [] as string[];
    // for (const eventName in this.events.keys) {
    //   for (const pluginName of this.events[eventName]) {
    //     if (!this.plugins.find((p) => p.id == pluginName)) {
    //       pluginNames.push(pluginName);
    //     }
    //   }
    // }
    return pluginNames;
  }

  get hasConflictingIds() {
    const idMap = {} as Record<string, boolean>;
    for (const plugin of this.plugins) {
      if (idMap[plugin.id] !== undefined) return true;
      idMap[plugin.id] = true;
    }
    return false;
  }

  removePlugin(i: number) {
    this.plugins.splice(i, 1);
    if (this.plugins.length == 0) this.counter = 0;
  }

  copyOutput() {
    navigator.clipboard.writeText(this.output).then(
      () => {
        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  }

  parseArgs(args: string): object | undefined {
    let obj: object | undefined;
    try {
      if (this.mode === "json") {
        obj = JSON.parse(args);
      } else {
        obj = YAML.parse(args);
      }
      return obj;
    } catch (err) {
      console.log(err);
    }
  }

  compileOutput() {
    const pluginMap = {} as Record<string, any>;
    for (const plugin of this.plugins) {
      //TODO: use hasValidArgs
      let objectArgs = this.parseArgs(plugin.args);
      const obj = {
        path: plugin.path,
        args: objectArgs,
      };
      pluginMap[plugin.id] = obj;
    }
    const eventsMap = {} as Record<string, string[]>;
    for (const event of this.eventsChunked.flat() as ISettingItem[]) {
      eventsMap[event.key] = event.val as string[];
    }
    const globalSettingsMap = {} as Record<string, any>;
    for (const globalSetting of this.globalSettingsChunked.flat() as ISettingItem[]) {
      globalSettingsMap[globalSetting.key] = globalSetting.val;
    }
    if (this.mode == "json") {
      this.output = JSON.stringify(
        { plugins: { ...globalSettingsMap, events: eventsMap, register: pluginMap } },
        null,
        2
      );
    } else {
      this.output = YAML.stringify({
        plugins: { ...globalSettingsMap, events: eventsMap, register: pluginMap },
      });
    }
  }

  addPlugin() {
    this.plugins.push({
      iid: this.counter.toString(),
      id: "", //Plugin " + this.counter++",
      path: "",
      args: "{}",
      hasValidArgs: true,
      version: "",
      // events: [],
    });
    this.compileOutput();
  }

  chunk(array: object[], size: number) {
    const chunked_arr: object[] = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  }

  @Watch("plugins", { deep: true })
  onPluginChange(newVal, oldVal) {
    this.compileOutput();
  }

  @Watch("events", { deep: true })
  onEventChange() {
    this.compileOutput();
  }
}
</script>

<style lang="scss" scoped>
.output-title {
  background: #090909;
  border-radius: 4px;
}
.output {
  background: #090909;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre;
}
</style>
