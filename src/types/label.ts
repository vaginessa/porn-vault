import { database } from "../database";
import { generateHash } from "../hash";

export default class Label {
  id: string;
  name: string;
  aliases: string[] = [];
  addedOn = +new Date();
  thumbnail: string | null = null;

  static filterImage(image: string) {
    database
      .get("labels")
      .find({ thumbnail: image })
      .assign({ thumbnail: null })
      .write();
  }

  static remove(id: string) {
    database
      .get("labels")
      .remove({ id })
      .write();
  }

  static getById(id: string): Label | null {
    return Label.getAll().find(label => label.id == id) || null;
  }

  static getAll(): Label[] {
    return database.get("labels").value();
  }

  static find(name: string) {
    name = name.toLowerCase().trim();
    return Label.getAll().find(
      label =>
        label.name === name ||
        label.aliases.map(alias => alias.toLowerCase()).includes(name)
    );
  }

  constructor(name: string, aliases: string[] = []) {
    this.id = generateHash();
    this.name = name.trim();
    this.aliases = aliases.map(alias => alias.toLowerCase().trim());
  }
}
