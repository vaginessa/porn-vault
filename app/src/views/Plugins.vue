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
            <v-btn v-on="on" @click="loadPluginsConfig" icon>
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

    <template v-if="loadingConfig">
      <v-progress-circular></v-progress-circular>
    </template>
    <template v-else>
      <!-- Events mapping -->
      <v-card class="mb-3">
        <v-card-title><v-icon class="pr-2 mb-1">mdi-launch</v-icon>Events</v-card-title>
        <v-card-subtitle
          >For each event, select plugins in the order you want to run them</v-card-subtitle
        >
        <v-card-text>
          <v-row dense>
            <v-col cols="12" :sm="6" v-for="(event, key) in EVENTS" :key="key">
              <v-select
                chips
                :items="pluginsBySupportedEvents[key]"
                clearable
                v-model="editEvents[key]"
                multiple
                v-bind="event.props"
                persistent-hint
                no-data-text="No plugins are available for this event"
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
        <v-card-subtitle>Configure or add new plugins</v-card-subtitle>
        <v-card-text>
          <div v-if="!editPlugins.length">
            You have no plugins. Click the "+" icon to create one.
          </div>
          <template v-else>
            <v-expansion-panels popout multiple>
              <Plugin
                @delete="removePlugin(plugin, i)"
                v-model="editPlugins[i]"
                v-for="(plugin, i) in editPlugins"
                :key="plugin._key"
                :hasConflictingId="hasConflictingId(plugin)"
            /></v-expansion-panels>
          </template>
        </v-card-text>
      </v-card>

      <!-- Global settings -->
      <v-card class="mb-3">
        <v-card-title>
          <v-icon class="pr-2 mb-1">mdi-tune</v-icon>Global plugin settings
        </v-card-title>
        <v-card-subtitle>Configure the behaviour of all plugins</v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="12" :sm="3" v-for="(globalSetting, key) in GLOBAL_SETTINGS_MAP" :key="key">
              <v-switch
                v-if="globalSetting.type === 'boolean'"
                v-model="editGlobalValues[key]"
                flat
                dense
                hide-details
                v-bind="globalSetting.props"
              ></v-switch>
              <v-text-field
                v-if="globalSetting.type !== 'boolean'"
                v-model="editGlobalValues[key]"
                flat
                dense
                v-bind="globalSetting.props"
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
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Plugin from "@/components/Plugins/Item.vue";
import YAML from "yaml";
import Code, { Mode as CodeMode } from "@/components/Code.vue";
import Axios from "axios";

const GLOBAL_SETTINGS_MAP = {
  allowSceneThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite scene thumbnail",
    },
  },
  allowActorThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite actor images",
    },
  },
  allowMovieThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite movie images",
    },
  },
  allowStudioThumbnailOverwrite: {
    type: "boolean",
    props: {
      label: "Allow plugins to overwrite studio thumbnail",
    },
  },
  createMissingActors: {
    type: "boolean",
    props: {
      label: "Create actors returned from plugins when not found in library",
    },
  },
  createMissingStudios: {
    type: "boolean",
    props: {
      label: "Create studios returned from plugins when not found in library",
    },
  },
  createMissingLabels: {
    type: "boolean",
    props: {
      label: "Create labels returned from plugins when not found in library",
    },
  },
  createMissingMovies: {
    type: "boolean",
    props: {
      label: "Create movies returned from plugins when not found in library",
    },
  },
  markerDeduplicationThreshold: {
    type: "number",
    props: {
      label: "Threshold in which new markers will be ignored",
      suffix: "s",
    },
  },
};

const EVENTS = {
  actorCreated: { props: { label: "actorCreated", hint: "Actor created" } },
  actorCustom: { props: { label: "actorCustom", hint: "User triggers actor plugins" } },
  movieCreated: { props: { label: "movieCreated", hint: "Movie created" } },
  movieCustom: { props: { label: "movieCustom", hint: "User triggers movie plugins" } },
  sceneCreated: { props: { label: "sceneCreated", hint: "Scene created" } },
  sceneCustom: { props: { label: "sceneCustom", hint: "User triggers scene plugins" } },
  studioCreated: { props: { label: "studioCreated", hint: "Studio created" } },
  studioCustom: { props: { label: "studioCustom", hint: "User triggers studio plugins" } },
};

interface ConfigPlugin {
  name: string;
  path: string;
  args: object;
  version: string;
  events: string[];
}

type GlobalConfigValue = boolean | string | number | string[];

interface PluginRes {
  register: Record<string, ConfigPlugin>;
  events: Record<string, string[]>;
  global: Record<string, GlobalConfigValue>;
}

interface EditPlugin {
  _key: number;
  id: string;
  path: string;
  args: string;
  version: string;
  hasValidArgs: boolean;
  events: string[];
}

@Component({
  components: {
    Plugin,
    Code,
  },
})
export default class PluginPage extends Vue {
  mode = CodeMode.JSON;
  showFullConfig = false;

  counter = 0;
  editPlugins = [] as EditPlugin[];
  editEvents: Record<string, string[]> = {};
  editGlobalValues: Record<string, GlobalConfigValue> = {};

  loadingConfig = true;
  config: PluginRes | null = null;
  GLOBAL_SETTINGS_MAP = GLOBAL_SETTINGS_MAP;
  EVENTS = EVENTS;

  toEditPlugin(configPlugin: ConfigPlugin): EditPlugin {
    return {
      _key: ++this.counter,
      id: configPlugin.name,
      path: configPlugin.path,
      args: JSON.stringify(configPlugin.args, null, 2),
      version: configPlugin.version,
      hasValidArgs: false,
      events: configPlugin.events,
    };
  }

  async savePlugin() {
    // TODO: implement
  }

  get pluginsBySupportedEvents(): Record<string, string[]> {
    return Object.fromEntries(
      Object.keys(EVENTS).map((event) => {
        const plugins = this.editPlugins
          .filter((p) => !p.events.length || p.events.includes(event))
          .map((p) => p.id);
        return [event, plugins];
      })
    );
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
    for (const plugin of this.editPlugins) {
      if (idMap[plugin.id] !== undefined) return true;
      idMap[plugin.id] = true;
    }
    return false;
  }

  removePlugin(plugin: EditPlugin, i: number) {
    // Remove the plugin
    this.editPlugins.splice(i, 1);
    // Remove the plugin from events
    Object.keys(this.editEvents).forEach((event) => {
      this.editEvents[event] = this.editEvents[event].filter((p) => p !== plugin.id);
    });
    // Reset plugin counter if we have no more plugins
    if (this.editPlugins.length == 0) {
      this.counter = 0;
    }
  }

  parseArgs(args: string): object {
    try {
      if (this.mode === "json") {
        return JSON.parse(args);
      } else {
        return YAML.parse(args);
      }
    } catch (err) {
      return {};
    }
  }

  get fullConfig() {
    const pluginMap = {} as Record<string, any>;

    for (const plugin of this.editPlugins) {
      let objectArgs = this.parseArgs(plugin.args);
      const obj = {
        path: plugin.path,
        args: objectArgs,
      };
      pluginMap[plugin.id] = obj;
    }
    const eventsMap = {} as Record<string, string[]>;
    for (const event in EVENTS) {
      eventsMap[event] = this.editEvents[event] || [];
    }
    const globalSettingsMap = {} as Record<string, any>;
    for (const [globalSetting, value] of Object.entries(this.editGlobalValues)) {
      globalSettingsMap[globalSetting] = value;
    }

    return { plugins: { ...globalSettingsMap, events: eventsMap, register: pluginMap } };
  }

  addPlugin() {
    this.editPlugins.push({
      _key: ++this.counter,
      id: "",
      path: "",
      args: "{}",
      hasValidArgs: true,
      version: "",
      events: [],
    });
  }

  hasConflictingId(plugin: EditPlugin) {
    return this.editPlugins.filter((p) => p.id === plugin.id).length > 1;
  }

  async loadPluginsConfig() {
    this.loadingConfig = true;

    try {
      const res = await Axios.get<PluginRes>("/api/plugins", {
        params: { password: localStorage.getItem("password") },
      });
      this.config = res.data;
      // Clone config to prevent mutations
      const editConfig = JSON.parse(JSON.stringify(this.config)) as PluginRes;

      this.editPlugins = Object.values(editConfig.register).map((pluginConfig) =>
        this.toEditPlugin(pluginConfig)
      );
      this.editEvents = editConfig.events;
      this.editGlobalValues = { ...editConfig.global };
    } catch (err) {
      console.error(err);
    }

    this.loadingConfig = false;
  }

  created() {
    this.loadPluginsConfig();
  }
}
</script>

<style lang="scss" scoped></style>
