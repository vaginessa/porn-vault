<template>
  <div v-if="files.length">
    {{ currentFolder }}
    <div @click="moveToFolder(parentFolder)" class="file hover" v-if="parentFolder">..</div>
    <div @click="handleFileClick(file)" class="file hover" v-for="file in files" :key="file.path">
      <div v-if="file.dir">> {{ file.name }}</div>
      <div v-else>
        <span v-if="selectedFile == file.path">
          <b>{{ file.name }}</b>
        </span>
        <span v-else>
          {{ file.name }}
        </span>
      </div>
      <div style="flex-grow: 1"></div>
      <div>{{ file.size }} bytes</div>
    </div>
    Selected file: {{ selectedFile }}
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";
import axios from "axios";

interface IFile {
  name: string;
  path: string;
  size: number;
  createdOn: number;
  dir: boolean;
}

interface IReadDirResult {
  path: string;
  files: IFile[];
  parentFolder: string;
  hasParentFolder: boolean;
}

async function readDir(path?: string | null) {
  const res = await axios.get<IReadDirResult>("/api/browse", {
    params: {
      path,
    },
  });

  res.data.files.sort((a, b) => +b.dir - +a.dir);

  return res.data;
}

export default defineComponent({
  props: {},
  setup() {
    const selectedFile = ref<string | null>(null);

    const parentFolder = ref<string | null>(null);
    const currentFolder = ref<string | null>(null);
    const files = ref<IFile[]>([]);

    async function getData() {
      const { path, parentFolder: parent, hasParentFolder, files: fileList } = await readDir(
        currentFolder.value
      );
      currentFolder.value = path;
      parentFolder.value = hasParentFolder ? parent : null;
      files.value = fileList;
    }

    async function moveToFolder(path: string) {
      currentFolder.value = path;
      await getData();
    }

    async function handleFileClick(file: IFile) {
      if (file.dir) {
        await moveToFolder(file.path);
      } else {
        selectedFile.value = file.path;
      }
    }

    onMounted(() => {
      getData();
    });

    return {
      selectedFile,
      currentFolder,
      files,

      moveToFolder,
      parentFolder,

      handleFileClick,
    };
  },
});
</script>

<style>
.file {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  border-bottom: 1px solid #d5d5d5;
  cursor: pointer;
  background: white;
  text-overflow: ellipsis;
  flex-wrap: nowrap;
  overflow: hidden;
}

.file:nth-child(even) {
  background: #f5f5f5;
}
</style>
