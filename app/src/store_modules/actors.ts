import Star from '@/classes/actor';
import Vue from "vue";

export default {
  namespaced: true,

  state: {
    items: [] as Star[]
  },
  getters: {
    getAll(state: any): Star[] {
      return state.items;
    }
  },
  mutations: {
    set(state: any, items: Star[]) {
      state.items = items;
    },
  },
  actions: {
  },
}