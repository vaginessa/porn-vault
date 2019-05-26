<template>
  <div>
    <h1 v-if="dragOver" class="fixed-center">Dragging...</h1>

    <v-dialog persistent :value="toAdd.length" max-width="500px">
      <v-card>
        <v-container>
          <v-card-title class="title mb-3">Manage new videos</v-card-title>
          <v-card v-for="file in toAdd" :key="file.path" class="pa-1">
            <span>
              <v-subheader>{{ file.name }}</v-subheader>
              <p class="ml-3 sec--text">{{ file.path }}</p>
              <p
                class="ml-3 error--text"
                v-if="$store.getters['videos/getByPath'](file.path)"
              >Video already in library. Won't be added again.</p>
            </span>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat @click="removeFile(file.path)" color="error">Remove</v-btn>
            </v-card-actions>
          </v-card>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="toAdd = []">Abort</v-btn>
          <v-btn color="primary" @click="processFiles">Add to library</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dragOver: false,
      toAdd: []
    };
  },
  methods: {
    async processFiles() {
      for (const file of this.toAdd) {
        this.$store
          .dispatch("videos/add", {
            title: file.name,
            path: file.path,
            thumbnail: null,
            id: (+new Date() + Math.random()).toString(),
            stars: []
          })
          .then(() => {});
      }

      this.toAdd = [];
    },
    addFiles(files) {
      this.toAdd.push(
        ...Array.from(files).filter(
          file => !this.toAdd.find(v => v.path == file.path)
        )
      );
    },
    removeFile(path) {
      this.toAdd = this.toAdd.filter(file => file.path != path);
    }
  },
  beforeMount() {
    document.ondragover = ev => {
      ev.preventDefault();
      this.dragOver = true;
    };

    document.ondragleave = ev => {
      ev.preventDefault();
      this.dragOver = false;
    };

    document.ondrop = ev => {
      ev.preventDefault();
      let droppedFiles = ev.dataTransfer.files;
      this.addFiles(droppedFiles);
      this.dragOver = false;
    };
  }
};
</script>

<style scoped lang="scss">
</style>
