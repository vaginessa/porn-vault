import { database } from "../../database";
import Actor from "../../types/actor";
import Label from "../../types/label";
import Scene from "../../types/scene";
import Image from "../../types/image";
import { Dictionary } from "../../types/utility";

type ILabelUpdateOpts = Partial<{
  name: string;
  aliases: string[];
  thumbnail: string;
}>;

export default {
  removeLabels(_, { ids }: { ids: string[] }) {
    for (const id of ids) {
      const label = Label.getById(id);

      if (label) {
        Label.remove(label.id);

        Actor.filterLabel(label.id);
        Scene.filterLabel(label.id);
        Image.filterLabel(label.id);

        return true;
      }
    }
  },

  addLabel(_, args: Dictionary<any>) {
    const label = new Label(args.name, args.aliases);

    database
      .get("labels")
      .push(label)
      .write();

    return label;
  },

  updateLabels(_, { ids, opts }: { ids: string[]; opts: ILabelUpdateOpts }) {
    const updatedLabels = [] as Label[];

    for (const id of ids) {
      const label = Label.getById(id);

      if (label) {
        if (Array.isArray(opts.aliases)) label.aliases = opts.aliases;

        if (typeof opts.name == "string") label.name = opts.name;

        if (typeof opts.thumbnail == "string")
          label.thumbnail = opts.thumbnail;

        database
          .get("labels")
          .find({ id: label.id })
          .assign(label)
          .write();

        updatedLabels.push(label);
      } else {
        throw new Error(`Label ${id} not found`);
      }
    }

    return updatedLabels;
  }
};
