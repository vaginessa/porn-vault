import Video from '@/classes/video';
import Vue from "vue";

type RootState = {
  items: Video[]
}

export default {
  namespaced: true,

  state: {
    items: [] as Video[]
  },
  getters: {
    getAll(state: RootState): Video[] {
      return state.items;
    },
    getByPath: (state: RootState) => (path: string): Video | undefined => {
      return state.items.find((v: Video) => v.path == path);
    },
    getByStar: (state: RootState) => (id: string): Video[] => {
      return state.items.filter((v: Video) => v.actors.includes(id));
    }
  },
  mutations: {
    set(state: RootState, items: Video[]) {
      state.items = items;
    },
    add(state: RootState, items: Video[]) {
      state.items.push(...items);
    },
    addThumbnails(state: RootState, { id, paths }: { id: string, paths: string[] }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.thumbnails.push(...paths);
        Vue.set(state.items, _index, video);
      }
    },
    setCoverIndex(state: RootState, { id, index }: { id: string, index: number }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.coverIndex = index;
        Vue.set(state.items, _index, video);
      }
    },
    edit(state: RootState, { id, settings }: { id: string, settings: any }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.title = settings.title || video.title;
        video.actors = settings.actors || video.actors;
        Vue.set(state.items, _index, video);
      }
    }
  },
  actions: {
    add(context: any, files: File[]) {
      return new Promise((resolve, reject) => {
        const videos = files.map(file => Video.create(file));
        context.commit("add", videos);
        resolve();
      })
    }
  },
}