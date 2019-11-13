import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class ActorModule extends VuexModule {
  current = null as any;

  @Mutation
  setCurrent(current: any) {
    this.current = current;
  }
}

import store from "./index";
export const actorModule = new ActorModule({ store, name: "actor" });
