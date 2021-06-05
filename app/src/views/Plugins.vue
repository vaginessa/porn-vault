<template>
  <v-container>
    <BindFavicon />

    <v-banner class="mb-3" app sticky>
      <template #actions>
        <!-- Icon toolbar and alert messages -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="showReloadConfirmation = true" icon color="error">
              <v-icon>mdi-reload-alert</v-icon>
            </v-btn>
          </template>
          <span>Discard changes and reload</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="saveAll" icon :disabled="hasError">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save settings</span>
        </v-tooltip>
      </template>
    </v-banner>

    <v-alert class="mb-3" v-if="hasUnnamedPlugins" dense type="error">Empty plugin ID(s)</v-alert>

    <v-alert class="mb-3" v-if="conflictingIds.length" dense type="error"
      >Conflicting plugin IDs: {{ conflictingIds.join(", ") }}
    </v-alert>
    <v-alert class="mb-3" v-if="unknownPlugins.length" dense type="error"
      >Unknown plugin(s): {{ unknownPlugins.join(", ") }}</v-alert
    >
    <v-alert class="mb-3 black--text" v-if="unusedPlugins.length" dense type="warning"
      >Unused plugin(s): {{ unusedPlugins.join(", ") }}</v-alert
    >
    <v-alert class="mb-3 black--text" v-if="invalidPluginArgNames.length" dense type="warning"
      >Invalid args for plugin(s): {{ invalidPluginArgNames.join(", ") }}</v-alert
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
                no-data-text="You don't have any plugins available for this event"
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
                  :error="hasUnnamedPlugins || conflictingIds.length || unknownPlugins.length"
                >
                  <template #error> Invalid input. See error above. </template>
                </Code>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="showReloadConfirmation" max-width="400px">
      <v-card>
        <v-card-title>Really abandon all changes and reload ?</v-card-title>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showReloadConfirmation = false" text class="text-none">Cancel</v-btn>
          <v-btn @click="loadPluginsConfig" text color="error" class="text-none">Reload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  authors: string[];
  description: string;
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
  authors: string[];
  description: string;
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
  showReloadConfirmation = false;

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
      hasValidArgs: true,
      events: configPlugin.events,
      authors: configPlugin.authors,
      description: configPlugin.description,
    };
  }

  async saveAll() {
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

  get unusedPlugins(): string[] {
    return this.editPlugins
      .filter(
        (plugin) =>
          !Object.keys(EVENTS).some((eventName) => this.editEvents[eventName]?.includes(plugin.id))
      )
      .map((p) => p.id || "(unnamed plugin)");
  }

  get unknownPlugins(): string[] {
    const unregisteredPluginNames = [] as string[];
    for (const [eventName, pluginNames] of Object.entries(this.editEvents)) {
      unregisteredPluginNames.push(
        ...pluginNames.filter((name) => !this.editPlugins.find((p) => p.id === name))
      );
    }
    return unregisteredPluginNames;
  }

  get hasUnnamedPlugins(): boolean {
    return this.editPlugins.some((p) => !p.id || !p.id.trim());
  }

  get conflictingIds() {
    const dupIds: string[] = [];
    const idMap = {} as Record<string, boolean>;
    for (const plugin of this.editPlugins) {
      if (idMap[plugin.id] === true) {
        dupIds.push(plugin.id);
      }
      idMap[plugin.id] = true;
    }
    return dupIds;
  }

  get invalidPluginArgNames(): string[] {
    return this.editPlugins.filter((p) => !p.hasValidArgs).map((p) => p.id);
  }

  get hasError(): boolean {
    return (
      !!this.invalidPluginArgNames.length ||
      this.hasUnnamedPlugins ||
      !!this.unknownPlugins.length ||
      !!this.conflictingIds.length
    );
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
      authors: [],
      description: "",
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
