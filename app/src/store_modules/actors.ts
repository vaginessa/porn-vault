import Star from '@/classes/actor';
import Vue from "vue";

type RootState = {
  items: Star[]
}

export default {
  namespaced: true,

  state: {
    items: []
  },
  getters: {
    getAll(state: RootState): Star[] {
      return state.items;
    }
  },
  mutations: {
    set(state: RootState, items: Star[]) {
      state.items = items;
    },
    add(state: RootState, item: Star) {
      state.items.push(item);
    }
  },
  actions: {
  },
}