import { hash } from '@/util/generator';
const { shell } = require("electron");

export default class Image {
  id: string = hash();
  name: string = "";
  path: string = "";
  addedOn: number = +new Date();
  actors: string[] = [];
  size: number = 0;
  labels: string[] = [];
  favorite: boolean = false;
  bookmark: boolean = false;
  rating: number = 0;
  customFields: {} = {};
  collection: string | null = null;
  video: string | null = null;

  static create(file: { name: string, path: string, size: number }): Image {
    let image = new Image();
    image.name = file.name;
    image.path = file.path;
    image.size = file.size;
    return image;
  }

  open(): void {
    shell.openItem(this.path);
  }
}