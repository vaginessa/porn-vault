import { hash } from '@/util/generator';
import Video from "./video";
import store from "../store";

export default class Actor {
  id: string = hash();
  name: string = "";
  addedOn: number = +new Date();
  thumbnails: string[] = [];
  labels: string[] = [];
  favorite: boolean = false;
  bookmark: boolean = false;
  rating: number = 0;
  customFields: {} = {};
  coverIndex: number = 0;

  static create(name: string): Actor {
    let actor = new Actor();
    actor.name = name;
    return actor;
  }

  getVideos(): Video[] {
    return store.getters["videos/getByActor"](this.id);
  }
}