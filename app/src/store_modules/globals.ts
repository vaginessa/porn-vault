import Star from '@/classes/actor';
import Vue from "vue";
import CustomField from '@/classes/custom_field';

type RootState = {
  settings: {
    copyThumbnails: boolean;
    darkMode: boolean;
  };
  customFields: CustomField[];
}

export default {
  namespaced: true,

  state: {
    settings: {
      copyThumbnails: true,
      darkMode: false
    },
    customFields: []
  },
  mutations: {
    set(state: RootState, newState: RootState) {
      Vue.set(state, "settings", newState.settings);
      state.customFields = newState.customFields;
    },
    setDarkMode(state: RootState, bool: boolean) {
      state.settings.darkMode = bool;
    }
  },
  actions: {
  },
  getters: {
    get(state: RootState) {
      return state;
    },
    darkMode(state: RootState) {
      return state.settings.darkMode;
    }
  }
}