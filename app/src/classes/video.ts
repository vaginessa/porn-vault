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
  labels: string[] = [];
  size: number = 0;
  coverIndex: number = 0;

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