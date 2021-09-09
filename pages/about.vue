<template>
  <div style="margin-top: 25px; text-align: center">
    <div>
      <div style="font-size: 20px">
        Porn Vault
        <span style="font-weight: bold">
          {{ version }}
        </span>
      </div>
    </div>
    <div style="margin-top: 25px">
      <a href="https://porn-vault.github.io/porn-vault/" target="_blank">Webpage</a>
    </div>
    <div style="margin-top: 25px">
      <a href="https://github.com/porn-vault/porn-vault" target="_blank">Github</a>
    </div>
    <div style="margin-top: 25px">
      <a href="https://discord.gg/t499hxK" target="_blank">Discord</a>
    </div>
    <div style="margin-top: 25px">
      <a href="https://www.patreon.com/pornvault" target="_blank">Patreon</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, useMeta } from "@nuxtjs/composition-api";
import axios from "axios";
import { getUrl } from "../client/util/url";

async function fetchVersion(): Promise<string> {
  const res = await axios.get<{ result: string }>(getUrl("/api/version", process.server));
  return res.data.result;
}

export default defineComponent({
  head: {},
  setup() {
    const { title } = useMeta();

    title.value = "About";

    const version = ref("");

    onMounted(async () => {
      fetchVersion().then((result) => {
        version.value = result;
      });
    });

    return { version };
  },
});
</script>
