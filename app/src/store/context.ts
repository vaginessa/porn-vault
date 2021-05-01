import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class ContextModule extends VuexModule {
  showFilters = false;

  sceneAspectRatio = 16 / 9;
  actorAspectRatio = 3 / 4;
  scenePauseOnUnfocus = false;
  showCardLabels = true;

  fillActorCards = true;

  actorSingular = "Actor";
  actorPlural = "Actors";

  showSidenav = true; // TODO: store and load from localStorage
  scenePreviewOnMouseHover = false;
  sceneSeekBackward = 5;
  sceneSeekForward = 5;

  experimental = false;

  @Mutation
  toggleExperimental(bool: boolean) {
    this.experimental = bool;
  }

  @Mutation
  toggleSidenav(bool: boolean) {
    this.showSidenav = bool;
  }

  @Mutation
  toggleActorCardStyle(bool: boolean) {
    this.fillActorCards = bool;
  }

  @Mutation
  toggleCardLabels(bool: boolean) {
    this.showCardLabels = bool;
  }

  @Mutation
  toggleFilters(bool: boolean) {
    this.showFilters = bool;
  }

  @Mutation
  setScenePauseOnUnfocus(val: boolean) {
    this.scenePauseOnUnfocus = val;
  }

  @Mutation
  setSceneAspectRatio(val: number) {
    this.sceneAspectRatio = val;
  }

  @Mutation
  setActorAspectRatio(val: number) {
    this.actorAspectRatio = val;
  }

  @Mutation
  setScenePreviewOnMouseHover(val: boolean) {
    this.scenePreviewOnMouseHover = val;
  }

  @Mutation
  setActorSingular(val: string) {
    this.actorSingular = val;
  }

  @Mutation
  setActorPlural(val: string) {
    this.actorPlural = val;
  }

  @Mutation
  setSceneSeekBackward(val: number) {
    this.sceneSeekBackward = val;
  }

  @Mutation
  setSceneSeekForward(val: number) {
    this.sceneSeekForward = val;
  }
}

import store from "./index";
export const contextModule = new ContextModule({ store, name: "context" });
