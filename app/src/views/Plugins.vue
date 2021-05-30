<template>
  <v-container>
    <BindFavicon />

    <v-banner class="mb-3" app sticky>
      <template #actions>
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
        </v-tooltip></template
      >
    </v-banner>

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
    <v-card class="mb-3">
      <v-card-title><v-icon class="pr-2 mb-1">mdi-launch</v-icon>Events</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" :sm="6" v-for="event in events" :key="event.key">
            <!-- TODO: filter plugins by event type to show only the matching one for a given event -->
            <v-select
              chips
              placeholder="Select plugins in the order you want to run them..."
              :label="event.key"
              :items="plugins.map((i) => i.id)"
              clearable
              v-model="event.val"
              multiple
            ></v-select>
          </v-col> </v-row
      ></v-card-text>
    </v-card>

    <!-- Plugins registration -->
    <v-card class="mb-3">
      <v-card-title>
        <v-icon class="pr-2 mb-1">mdi-toy-brick-outline</v-icon>Plugins
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="addPlugin" icon class="mb-1">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Add plugin</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <div v-if="!plugins.length">You have no plugins. Click the "+" icon to create one.</div>
        <Plugin
          v-else
          @delete="removePlugin(i)"
          class="mb-3"
          v-model="plugins[i]"
          v-for="(plugin, i) in plugins"
          :key="plugin.iid"
        />
      </v-card-text>
    </v-card>

    <!-- Global settings -->
    <v-card class="mb-3">
      <v-card-title>
        <v-icon class="pr-2 mb-1">mdi-tune</v-icon>Global plugin settings
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" :sm="3" v-for="globalSetting in globalSettings" :key="globalSetting.key">
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
      </v-card-text>
    </v-card>

    <!-- Full assembled config -->
    <v-row>
      <v-col>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header> <h3>Raw config</h3> </v-expansion-panel-header>
            <v-expansion-panel-content>
              <Code
                :content="fullConfig"
                :mode="mode"
                @changeMode="mode = $event"
                :error="hasConflictingIds || unknownPlugins.length"
              >
                <template #error> Invalid input. See error above. </template>
              </Code>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Plugin from "@/components/Plugins/Item.vue";
import YAML from "yaml";
import Code, { Mode as CodeMode } from "@/components/Code.vue";

interface IPlugin {
  id: string;
  iid: string;
  path: string;
  args: string;
  hasValidArgs: boolean;
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
    Code,
  },
})
export default class PluginPage extends Vue {
  plugins = [] as IPlugin[];

  counter = 0;

  mode = CodeMode.JSON;

  output = "";

  showFullConfig = false;

  events = [] as object[];

  globalSettings = [] as object[];

  async beforeMount() {
    await this.onLoad();
  }

  async onLoad() {
    this.plugins = await this.loadPlugins();
    this.events = await this.loadEvents();
    this.globalSettings = await this.loadGlobalSettings();
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
        version: "1.2.0",
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

  get fullConfig() {
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
    for (const event of this.events as ISettingItem[]) {
      eventsMap[event.key] = event.val as string[];
    }
    const globalSettingsMap = {} as Record<string, any>;
    for (const globalSetting of this.globalSettings as ISettingItem[]) {
      globalSettingsMap[globalSetting.key] = globalSetting.val;
    }

    return { plugins: { ...globalSettingsMap, events: eventsMap, register: pluginMap } };
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
  }
}
</script>

<style lang="scss" scoped></style>
