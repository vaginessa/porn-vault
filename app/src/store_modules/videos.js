export default {
  namespaced: true,

  state: {
    items: []
  },
  getters: {
    getByPath: state => path => {
      return state.items.find(v => v.path == path);
    }
  },
  mutations: {
    set(state, videos) {
      state.items = videos;
    },
    add(state, video) {
      state.items.push(video);
    }
  },
  actions: {
    add(context, video) {
      return new Promise((resolve, reject) => {
        context.commit("add", video);
        resolve();
      });
    }
  },
}