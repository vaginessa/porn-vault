import Star from '@/classes/actor';
import Vue from "vue";

export default {
  namespaced: true,

  state: {
    settings: {

    }
  },
  mutations: {
    setSettings(state: any, settings: any) {
      state.settings = settings;
    },
  },
  actions: {
  },
}