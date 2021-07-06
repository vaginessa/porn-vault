<template>
  <SettingsWrapper>
    <v-card class="mb-2">
      <v-row>
        <v-col class="pt-0" :cols="12" :sm="6" :md="12">
          <v-card-title>General</v-card-title>

          <v-card-text>
            <div class="mb-3">
              <div class="d-flex align-center">
                Porn Vault uptime: {{ connected ? pvUptime : "unknown" }}
              </div>
              <div class="d-flex align-center">
                OS uptime: {{ connected ? osUptime : "unknown" }}
              </div>
            </div>

            <v-divider></v-divider>

            <v-btn
              color="error"
              class="text-none my-3"
              @click="showStopConfirmation = true"
              :disabled="!connected"
              >Stop Porn Vault</v-btn
            >
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
    <v-card class="mb-2">
      <v-row>
        <v-col class="pt-0" :cols="12" :sm="6" :md="12">
          <v-card-title>Izzy</v-card-title>

          <v-card-text>
            <div class="mb-3">
              <div class="d-flex align-center">
                Status: {{ status.izzy.status }}
                <v-icon
                  class="ml-1"
                  v-if="status.izzy.status === ServiceStatus.Connected"
                  color="green"
                  dense
                  >mdi-check</v-icon
                >
                <v-icon class="ml-1" v-else color="error" dense>mdi-alert-circle</v-icon>
              </div>
              <div>Version: {{ status.izzy.version }}</div>
            </div>

            <v-divider></v-divider>

            <v-subheader class="pl-0">Collections</v-subheader>
            <div
              v-if="!status.izzy.collections || !status.izzy.collections.length"
              class="med--text"
            >
              No collection information
            </div>
            <template v-else>
              <v-simple-table class="mb-3">
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Size</th>
                      <th class="text-left">Document count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr :key="collection.name" v-for="collection of status.izzy.collections">
                      <td>{{ collection.name }}</td>
                      <td>
                        {{ Math.round(collection.size / 1000 / 1000).toFixed(1) }} MB ({{ collection.size }}
                        bytes)
                      </td>
                      <td>{{ collection.count }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </template>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="mb-2">
      <v-row>
        <v-col class="pt-0" :cols="12" :sm="6" :md="12">
          <v-card-title>Elasticsearch</v-card-title>

          <v-card-text>
            <div class="mb-3">
              <div class="d-flex align-center">
                Status: {{ status.elasticsearch.status }}
                <v-icon
                  class="ml-1"
                  v-if="status.elasticsearch.status === ServiceStatus.Connected"
                  color="green"
                  dense
                  >mdi-check</v-icon
                >
                <v-icon class="ml-1" v-else color="error" dense>mdi-alert-circle</v-icon>
              </div>
              <div>Version: {{ status.elasticsearch.version }}</div>
            </div>

            <v-divider></v-divider>

            <v-subheader class="pl-0">Indices</v-subheader>
            <div
              v-if="!status.elasticsearch.indices || !status.elasticsearch.indices.length"
              class="med--text"
            >
              No index information
            </div>
            <template v-else>
              <v-alert
                dense
                type="info"
                v-if="status.elasticsearch.indices.find((i) => i.health === 'yellow')"
                dismissible
              >
                Some indexes are yellow. This likely is because you only have 1 Elasticsearch node:
                the data is not replicated. You can safely ignore this.
              </v-alert>
              <v-simple-table class="mb-3">
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Health</th>
                      <th class="text-left">Status</th>
                      <th class="text-left">Size</th>
                      <th class="text-left">Document count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr :key="index.uuid" v-for="index of status.elasticsearch.indices">
                      <td>{{ index.index }}</td>
                      <td>
                        {{ index.health }}
                        <v-icon class="ml-1" :color="index.health" small>mdi-circle</v-icon>
                      </td>
                      <td>{{ index.status }}</td>
                      <td>{{ index["store.size"] }}</td>
                      <td>{{ index["docs.count"] }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </template>
            <v-divider></v-divider>

            <v-btn
              color="orange"
              class="text-none my-3"
              @click="showReindexWarning = true"
              :disabled="!connected"
              >Reindex</v-btn
            >
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="showStopConfirmation" max-width="400px">
      <v-card>
        <v-card-title>Really stop Porn Vault ?</v-card-title>
        <v-card-text>
          <v-checkbox v-model="stopIzzy" label="Stop Izzy"></v-checkbox>
          <v-alert type="info">
            You can stop Izzy to free up memory. It also means that the next startup will reload the
            database. And while Izzy is stopped, you can manually edit your database files.
            <br />
            Keeping Izzy alive will improve startup time, but maintain memory usage.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="text-none" text color="error" @click="confirmStop">Stop</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showReindexWarning" max-width="400px">
      <v-card>
        <v-card-title>Really reindex Elasticsearch ?</v-card-title>
        <v-card-text>
          You will not be able to use the server or application during this time.

          <v-alert class="mt-2" type="info">
            No data will be lost. This just recreates the indexes (used for search) from the
            database.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="text-none" text color="orange" @click="confirmReindex">Reindex</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </SettingsWrapper>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SettingsWrapper from "@/components/SettingsWrapper.vue";
import Axios from "axios";
import moment from "moment";
import { getFullStatus, StatusData, ServiceStatus } from "@/api/system";

const UPTIME_UPDATE_INTERVAL = 1;

@Component({
  components: {
    SettingsWrapper,
  },
})
export default class Status extends Vue {
  status: StatusData = {
    izzy: {
      status: ServiceStatus.Unknown,
      version: "unknown",
      collections: [],
      collectionBuildInfoMap: {},
      allCollectionsBuilt: false,
    },
    elasticsearch: {
      status: ServiceStatus.Unknown,
      version: "unknown",
      indices: [],
      indexBuildInfoMap: {},
      allIndexesBuilt: false,
    },
    serverUptime: 0,
    osUptime: 0,
    serverReady: false,
  };

  ServiceStatus = ServiceStatus;
  showReindexWarning = false;
  showStopConfirmation = false;
  stopIzzy = false;

  uptimeOffset = 0;
  pvUptime = "";
  osUptime = "";

  connected = false;

  async fetchData() {
    try {
      const res = await getFullStatus();
      this.connected = true;
      this.status = res.data;
      this.uptimeOffset = 0;
    } catch (err) {
      console.error(err);
    }
  }

  updateUptime() {
    if (!this.connected) {
      return;
    }

    const start = moment();

    const endPvUptime = start.clone().add(this.status.serverUptime + this.uptimeOffset, "seconds");
    const diffPvUptime = endPvUptime.diff(start);

    const endOSUptime = start.clone().add(this.status.osUptime + this.uptimeOffset, "seconds");
    const diffOSUptime = endOSUptime.diff(start);

    this.uptimeOffset += UPTIME_UPDATE_INTERVAL;

    this.pvUptime = moment.utc(diffPvUptime).format("HH:mm:ss");
    this.osUptime = moment.utc(diffOSUptime).format("HH:mm:ss");
  }

  async confirmStop() {
    try {
      await Axios.post("/api/system/exit", { stopIzzy: this.stopIzzy });
    } catch (err) {
      console.error(err);
    }
    // Reload the tab and not vue-router
    window.location.reload();
  }

  async confirmReindex() {
    try {
      await Axios.post(
        "/api/system/reindex",
        {},
        {
          params: { password: localStorage.getItem("password") },
        }
      );
      this.$router.push({
        name: "setup",
        query: { returnName: this.$router.currentRoute.name, initialStep: "2" },
      });
    } catch (err) {
      console.error(err);
    }
  }

  mounted() {
    this.fetchData();
    setInterval(this.fetchData, 30 * 1000);
    setInterval(this.updateUptime, UPTIME_UPDATE_INTERVAL * 1000);
  }
}
</script>
