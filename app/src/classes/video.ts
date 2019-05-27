import { hash } from '@/util/generator';
const { shell } = require("electron");

export default class Video {
  id: string = hash();
  title: string = "";
  path: string = "";
  addedOn: number = +new Date();
  actors: string[] = [];
  releaseDate: string | null = null;
  thumbnails: string[] = [];
  size: number = 0;
  coverIndex: number = 0;
  labels: string[] = [];
  favorite: boolean = false;
  bookmark: boolean = false;
  rating: number = 0;
  customFields: {} = {};
  collection: string | null = null;

  static create(file: File): Video {
    let video = new Video();
    video.title = file.name;
    video.path = file.path;
    video.size = file.size;
    return video;
  }

  open(): void {
    shell.openItem(this.path);
  }
}