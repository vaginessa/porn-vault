import Star from '@/classes/actor';
import Vue from "vue";
import CustomField, { CustomFieldType } from '@/classes/custom_field';

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
    },
    addCustomField(state: RootState, field: CustomField) {
      state.customFields.push(field);
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