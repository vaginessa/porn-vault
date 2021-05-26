<template>
  <div
    class="scene card rounded"
    :style="{
      background: `${(scene.thumbnail && scene.thumbnail.color) || 'white'} !important`,
    }"
  >
    <nuxt-link :to="`/scene/${scene._id}`">
      <img
        :src="`/api/media/image/${scene.thumbnail._id}/thumbnail?password=xxx`"
        :alt="scene.name"
        class="thumb hover"
      />
    </nuxt-link>

    <div
      class="card-body"
      :style="{
        color: scene.thumbnail && scene.thumbnail.color ? 'white' : 'black',
      }"
    >
      <div style="display: flex">
        <div v-if="scene.studio" class="studio-name">
          <b>{{ scene.studio.name }}</b>
        </div>
        <div style="flex-grow: 1"></div>
        <div v-if="scene.releaseDate" class="release-date">
          {{ new Date(scene.releaseDate).toLocaleDateString() }}
        </div>
      </div>

      <div class="scene-name" :title="scene.name">
        <b>{{ scene.name }}</b>
      </div>

      <div class="actor-names">
        <span>With </span>
        <span v-for="(actor, i) in scene.actors" :key="actor._id">
          <b>{{ actor.name }}</b
          ><span v-if="i < scene.actors.length - 1">{{
            i === scene.actors.length - 2 ? " & " : ", "
          }}</span>
        </span>
      </div>

      <div class="rating">{{ (scene.rating / 2).toFixed(1) }}★</div>

      <div v-if="scene.labels.length">
        {{ scene.labels.map((l) => l.name).slice(0, 5) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["scene"],
};
</script>

<style scoped>
.scene {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px !important;
}

.thumb {
  width: 100%;
  height: auto;
}

.card-body {
  text-align: left;
  flex-grow: 1;
  padding: 8px;
}

.studio-name {
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 4px;
}

.scene-name {
  font-size: 16.5px;
  margin-bottom: 6px;

  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actor-names {
  font-size: 13.5px;
  margin-bottom: 6px;
}

.rating {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 6px;
}

.release-date {
  font-size: 13.5px;
}
</style>
