import Video from '@/classes/video';
import Vue from "vue";

export default {
  namespaced: true,

  state: {
    items: [] as Video[]
  },
  getters: {
    getAll(state: any): Video[] {
      return state.items;
    },
    getByPath: (state: any) => (path: string) => {
      return state.items.find((v: Video) => v.path == path);
    },
    getByStar: (state: any) => (id: string) => {
      return state.items.filter((v: Video) => v.actors.includes(id));
    }
  },
  mutations: {
    set(state: any, items: Video[]) {
      state.items = items;
    },
    add(state: any, items: Video[]) {
      state.items.push(...items);
    },
    addThumbnails(state: any, { id, paths }: { id: string, paths: string[] }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.thumbnails.push(...paths);
        Vue.set(state.items, _index, video);
      }
    },
    setCoverIndex(state: any, { id, index }: { id: string, index: number }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.coverIndex = index;
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