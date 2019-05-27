import Video from '@/classes/video';

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
    }
  },
  mutations: {
    set(state: any, items: Video[]) {
      state.items = items;
    },
    add(state: any, items: Video[]) {
      state.items.push(...items);
    }
  },
  actions: {
    add(context: any, files: File[]) {
      return new Promise((resolve, reject) => {
        console.log(files);
        const videos = files.map(file => Video.create(file));
        context.commit("add", videos);
        resolve();
      })
    }
  },
}