import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class SceneModule extends VuexModule {
  current = null as any;

  // mutations
  @Mutation
  setCurrent(current: any) {
    this.current = current;
  }
}

import store from "./index";
export const sceneModule = new SceneModule({ store, name: "scene" });