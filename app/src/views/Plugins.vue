<template>
  <SettingsWrapper>
    <BindFavicon />

    <!-- Make the banner appear above plugin item expansion panels -->
    <v-banner class="mb-3" app sticky style="z-index: 2">
      <h3>Plugins</h3>
      <template #actions>
        <!-- Icon toolbar and alert messages -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click="showReloadConfirmation = true"
              icon
              color="error"
              :disabled="!dirty"
            >
              <v-icon>mdi-reload-alert</v-icon>
            </v-btn>
          </template>
          <span>Discard changes and reload</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="saveAll" icon :disabled="hasError || !dirty">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save settings</span>
        </v-tooltip>
      </template>
    </v-banner>

    <v-alert class="mb-3" v-if="hasUnnamedPlugins" dense type="error">Empty plugin ID(s)</v-alert>
    <v-alert class="mb-3" v-if="unknownPlugins.length" dense type="error"
      >Unknown plugin(s): {{ unknownPlugins.join(", ") }}
    </v-alert>
    <v-alert class="mb-3" v-if="conflictingIds.length" dense type="error"
      >Conflicting plugin IDs: {{ conflictingIds.join(", ") }}
    </v-alert>
    <v-alert class="mb-3 black--text" v-if="invalidPluginArgNames.length" dense type="error"
      >Invalid args for plugin(s): {{ invalidPluginArgNames.join(", ") }}
    </v-alert>
    <v-alert class="mb-3 black--text" v-if="invalidPluginPathNames.length" dense type="error"
      >Invalid paths for plugin(s): {{ invalidPluginPathNames.join(", ") }}
    </v-alert>
    <v-alert class="mb-3 black--text" v-if="invalidPluginVersionNames.length" dense type="error"
      >Invalid versions for plugin(s): {{ invalidPluginVersionNames.join(", ") }}
    </v-alert>
    <v-alert class="mb-3 black--text" v-if="unusedPlugins.length" dense type="warning"
      >Unused plugin(s): {{ unusedPlugins.join(", ") }}
    </v-alert>

    <v-overlay absolute v-if="loadingConfig">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-overlay>

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
              @input="dirty = true"
              multiple
              v-bind="event.props"
              persistent-hint
              no-data-text="You don't have any compatible plugins for this event"
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
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="importDialog = true" icon class="mb-1">
              <v-icon>mdi-file-import</v-icon>
            </v-btn>
          </template>
          <span>Import plugin configuration</span>
        </v-tooltip>
      </v-card-title>
      <v-card-subtitle>Configure or add new plugins</v-card-subtitle>
      <v-card-text>
        <div v-if="!editPlugins.length">You have no plugins. Click the "+" icon to create one.</div>
        <template v-else>
          <v-expansion-panels popout multiple>
            <Plugin
              @delete="removePlugin(plugin, i)"
              v-model="editPlugins[i]"
              @input="dirty = true"
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
              @input="dirty = true"
              flat
              dense
              hide-details
              v-bind="globalSetting.props"
            ></v-switch>
            <v-text-field
              v-if="globalSetting.type !== 'boolean'"
              v-model="editGlobalValues[key]"
              @input="dirty = true"
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
              <Code :content="fullConfig" :error="hasError">
                <template #error> Invalid config. See error above. </template>
              </Code>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-dialog v-model="showReloadConfirmation" max-width="400px">
      <v-card>
        <v-card-title>Really abandon all changes and reload ?</v-card-title>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showReloadConfirmation = false" text class="text-none">Cancel</v-btn>
          <v-btn
            @click="
              showReloadConfirmation = false;
              loadPluginsConfig();
            "
            text
            color="error"
            class="text-none"
            >Reload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ImportPluginDialog v-model="importDialog" @import="importPlugin"></ImportPluginDialog>
  </SettingsWrapper>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import SettingsWrapper from "@/components/SettingsWrapper.vue";
import Plugin from "@/components/Plugins/Item.vue";
import ImportPluginDialog from "@/components/Plugins/ImportPluginDialog.vue";
import Code from "@/components/Code.vue";
import {
  GlobalConfigValue,
  getPluginsConfig,
  ConfigPlugin,
  PluginRes,
  savePluginsConfig,
} from "@/api/plugins";
import { EVENTS } from "@/constants/plugins";

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

interface EditPlugin {
  _key: number;
  id: string;
  path: string;
  args: object;
  version: string;
  requiredVersion: string;
  hasValidArgs: boolean;
  hasValidPath: boolean;
  hasValidVersion: boolean;
  events: string[];
  authors: string[];
  description: string;
}

@Component({
  components: {
    Plugin,
    Code,
    ImportPluginDialog,
    SettingsWrapper,
  },
})
export default class PluginPage extends Vue {
  showFullConfig = false;
  showReloadConfirmation = false;
  importDialog = false;

  counter = 0;
  editPlugins = [] as EditPlugin[];
  editEvents: Record<string, string[]> = {};
  editGlobalValues: Record<string, GlobalConfigValue> = {};
  dirty = false;

  loadingConfig = true;
  errorSaving = false;
  config: PluginRes | null = null;
  GLOBAL_SETTINGS_MAP = GLOBAL_SETTINGS_MAP;
  EVENTS = EVENTS;

  toEditPlugin(configPlugin: ConfigPlugin): EditPlugin {
    return {
      _key: ++this.counter,
      id: configPlugin.name,
      path: configPlugin.path,
      args: configPlugin.args,
      version: configPlugin.version,
      requiredVersion: configPlugin.requiredVersion,
      hasValidArgs: true,
      hasValidPath: true,
      hasValidVersion: true,
      events: configPlugin.events,
      authors: configPlugin.authors,
      description: configPlugin.description,
    };
  }

  async saveAll() {
    this.loadingConfig = true;

    try {
      await savePluginsConfig(this.fullConfig.plugins);
      this.dirty = false;
    } catch (err) {
      this.errorSaving = true;
    }

    this.loadingConfig = false;
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
          plugin.id &&
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
    return [...new Set(unregisteredPluginNames)];
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
    return [...new Set(dupIds)];
  }

  get invalidPluginArgNames(): string[] {
    const ids = this.editPlugins.filter((p) => p.id && !p.hasValidArgs).map((p) => p.id);
    return [...new Set(ids)];
  }

  get invalidPluginPathNames(): string[] {
    const ids = this.editPlugins.filter((p) => p.id && !p.hasValidPath).map((p) => p.id);
    return [...new Set(ids)];
  }

  get invalidPluginVersionNames(): string[] {
    const ids = this.editPlugins.filter((p) => p.id && !p.hasValidVersion).map((p) => p.id);
    return [...new Set(ids)];
  }

  get hasError(): boolean {
    return (
      this.hasUnnamedPlugins ||
      !!this.unknownPlugins.length ||
      !!this.conflictingIds.length ||
      !!this.invalidPluginArgNames.length ||
      !!this.invalidPluginPathNames.length ||
      !!this.invalidPluginVersionNames.length
    );
  }

  removePlugin(plugin: EditPlugin, i: number) {
    // Remove the plugin
    const wasConflictingId = this.conflictingIds.includes(plugin.id);
    this.editPlugins.splice(i, 1);
    if (!wasConflictingId) {
      // Remove the plugin from events
      Object.keys(this.editEvents).forEach((event) => {
        this.editEvents[event] = this.editEvents[event].filter((p) => p !== plugin.id);
      });
    }
    // Reset plugin counter if we have no more plugins
    if (this.editPlugins.length == 0) {
      this.counter = 0;
    }
  }

  get fullConfig() {
    const pluginMap = {} as Record<string, any>;

    for (const plugin of this.editPlugins) {
      const obj = {
        path: plugin.path,
        args: plugin.args,
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
      args: {},
      hasValidArgs: true,
      hasValidPath: false,
      hasValidVersion: true,
      version: "",
      requiredVersion: "",
      events: [],
      authors: [],
      description: "",
    });
  }

  importPlugin(plugin: { id: string; path: string; args: object; events: string[] }): void {
    this.dirty = true;
    this.editPlugins.push({
      _key: ++this.counter,
      id: plugin.id,
      path: plugin.path,
      args: plugin.args,
      hasValidArgs: true,
      hasValidPath: false,
      hasValidVersion: true,
      version: "",
      requiredVersion: "",
      events: plugin.events,
      authors: [],
      description: "",
    });
    plugin.events.forEach((ev) => {
      if (!this.editEvents[ev].includes(plugin.id)) {
        this.editEvents[ev].push(plugin.id);
      }
    });
    this.importDialog = false;
  }

  hasConflictingId(plugin: EditPlugin) {
    return this.editPlugins.filter((p) => p.id === plugin.id).length > 1;
  }

  async loadPluginsConfig() {
    this.loadingConfig = true;

    try {
      const res = await getPluginsConfig();
      this.config = res.data;

      this.editPlugins = Object.values(this.config.register).map((pluginConfig) =>
        this.toEditPlugin(pluginConfig)
      );
      this.editEvents = this.config.events;
      this.editGlobalValues = { ...this.config.global };
      this.dirty = false;
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
