<template>
  <div class="text-xs-center">
    <v-avatar size="175" @click="goToActor">
      <v-img
        v-if="actor.thumbnails.length"
        class="thumb elevation-6"
        :aspect-ratio="1"
        v-ripple
        :src="actor.thumbnails[actor.coverIndex]"
      ></v-img>
      <v-img v-else class="thumb elevation-6" :aspect-ratio="1" v-ripple src style="background: grey"></v-img>
    </v-avatar>
    <div class="mt-3 ">
      <span class="subheading">{{ actor.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ["actor"],
  methods: {
    goToActor() {
      this.$router.push("/actor/" + this.actor.id);
    }
  },
}
</script>

<style>
.thumb {
  cursor: pointer;
}
</style>
