import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class SceneModule extends VuexModule {
  current = null as any;

  @Mutation
  setCurrent(current: any) {
    this.current = current;
  }

  @Mutation
  setFavorite(bool: boolean) {
    this.current.favorite = bool;
  }

  @Mutation
  setBookmark(bool: boolean) {
    this.current.bookmark = bool;
  }
}

import store from "./index";
export const sceneModule = new SceneModule({ store, name: "scene" });
