import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class ContextModule extends VuexModule {
  showFilters = false;
  showSidenav = true; // TODO: store and load from localStorage
  loadingSetup = true;
  serverReady = false;

  // UI > GENERAL
  showCardLabels = true;
  experimental = false;

  // UI > SCENES
  sceneAspectRatio = 16 / 9;
  scenePauseOnUnfocus = false;
  scenePreviewOnMouseHover = false;
  sceneSeekBackward = 5;
  sceneSeekForward = 5;

  // UI > ACTORS
  actorAspectRatio = 3 / 4;
  fillActorCards = true;
  actorSingular = "Actor";
  actorPlural = "Actors";

  // UI > MOVIES
  defaultDVDShow3d = true;

  @Mutation
  toggleLoadingSetup(bool: boolean) {
    this.loadingSetup = bool;
  }

  @Mutation
  toggleServerReady(bool: boolean) {
    this.serverReady = bool;
  }

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

  // MOVIES
  @Mutation
  toggleDefaultDVDShow3d(bool: boolean) {
    this.defaultDVDShow3d = bool;
  }
}

import store from "./index";
export const contextModule = new ContextModule({ store, name: "context" });
