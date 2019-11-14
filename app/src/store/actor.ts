import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class ActorModule extends VuexModule {
  current = null as any;

  @Mutation
  setName(name: string) {
    this.current.name = name;
  }

  @Mutation
  setAliases(aliases: string[]) {
    this.current.aliases = aliases;
  }

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

  @Mutation
  setRating(rating: number) {
    this.current.rating = rating;
  }

  @Mutation
  setThumbnail(id: string) {
    this.current.thumbnail.id = id;
  }

  @Mutation
  setLabels(labels: string[]) {
    this.current.labels = labels;
  }
}

import store from "./index";
export const actorModule = new ActorModule({ store, name: "actor" });
