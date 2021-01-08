<template>
  <div>
    <v-card-title class="pl-0 pb-0">Porn Vault</v-card-title>
    <v-card class="mb-2">
      <v-card-text>
        <v-card-title v-if="version" class="pl-0 pb-0 pt-0">Version: {{ version }}</v-card-title>
        <v-btn
          class="text-none mr-2 mb-2"
          depressed
            href="https://github.com/porn-vault/porn-vault"
          target="_blank"
        >
          <v-icon left>mdi-github</v-icon>GitHub
        </v-btn>

        <v-btn
          depressed
          href="https://discord.gg/t499hxK"
          target="_blank"
          color="#7289da"
          light
          class="text-none mr-2 mb-2"
        >
          <v-icon left>mdi-discord</v-icon>Discord
        </v-btn>

        <v-btn
          depressed
            href="https://github.com/porn-vault/porn-vault#support"
          target="_blank"
          color="primary"
          class="text-none mb-2"
          :class="$vuetify.theme.dark ? 'black--text' : ''"
        >
          <v-icon left>mdi-currency-btc</v-icon>Support
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Axios from "axios";
import { serverBase } from "@/apollo";

@Component({
  components: {},
})
export default class About extends Vue {
  version = "";

  async fetchVersion() {
    try {
      const res = await Axios.get(
        `${serverBase}/version?password=${localStorage.getItem("password")}`
      );
      this.version = res.data.result as string;
    } catch (err) {
      console.error(err);
    }
  }

  mounted() {
    this.fetchVersion();
  }
}
</script>

<style lang="scss" scoped>
.version-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
</style>
