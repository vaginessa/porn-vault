import { hash } from '@/util/generator';
import Video from "./video";
import store from "../store";

export default class Actor {
  id: string = hash();
  name: string = "";
  addedOn: number = +new Date();
  thumbnails: string[] = [];
  //labels: string[] = [];

  static create(): Actor {
    let video = new Actor();
    return video;
  }

  getVideos(): Video[] {
    return store.getters["videos/getByActor"](this.id);
  }
}