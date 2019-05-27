import Star from '@/classes/actor';
import Vue from "vue";
import CustomField from '@/classes/custom_field';

type RootState = {
  settings: {
    copyThumbnails: boolean;
  };
  customFields: CustomField[];
}

export default {
  namespaced: true,

  state: {
    settings: {
      copyThumbnails: true
    },
    customFields: []
  },
  mutations: {
    setSettings(state: RootState, settings: any) {
      state.settings = settings;
    },
  },
  actions: {
  },
}