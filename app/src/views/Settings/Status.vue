<template>
  <SettingsWrapper>
    <v-card class="mb-2">
      <v-row>
        <v-col class="pt-0" :cols="12" :sm="6" :md="12">
          <v-card-title>Izzy</v-card-title>

          <v-card-text>
            <div>Status: {{ status.izzyStatus }}</div>
            <div>Version: {{ status.izzyVersion }}</div>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="mb-2">
      <v-row>
        <v-col class="pt-0" :cols="12" :sm="6" :md="12">
          <v-card-title>Elasticsearch</v-card-title>

          <v-card-text>
            <div>Status: {{ status.esStatus }}</div>
            <div>Version: {{ status.esVersion }}</div>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </SettingsWrapper>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SettingsWrapper from "@/components/SettingsWrapper.vue";
import Axios from "axios";

interface StatusData {
  izzyStatus: string;
  izzyVersion: string;
  esStatus: string;
  esVersion: string;
}

@Component({
  components: {
    SettingsWrapper,
  },
})
export default class Status extends Vue {
  status: StatusData = {
    izzyStatus: "unknown",
    izzyVersion: "unknown",
    esVersion: "unknown",
    esStatus: "unknown",
  };

  async fetchData() {
    try {
      const res = await Axios.get("/api/system/status", {
        params: { password: localStorage.getItem("password") },
      });
      this.status = res.data;
    } catch (err) {
      console.error(err);
    }
  }

  mounted() {
    this.fetchData();
    setInterval(this.fetchData, 5 * 1000);
  }
}
</script>
