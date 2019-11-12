import { database } from "../../database";
import Actor from "../../types/actor";
import Scene from "../../types/scene";
import Image from "../../types/image";
import { Dictionary } from "../../types/utility";

type IActorUpdateOpts = Partial<{
  name: string;
  rating: number;
  labels: string[];
  aliases: string[];
  thumbnail: string;
  favorite: boolean;
  bookmark: boolean;
}>;

export default {
  addActor(_, args: Dictionary<any>) {
    const actor = new Actor(args.name, args.aliases);

    database
      .get("actors")
      .push(actor)
      .write();

    return actor;
  },

  updateActors(_, { ids, opts }: { ids: string[]; opts: IActorUpdateOpts }) {
    const updatedActors = [] as Actor[];

    for (const id of ids) {
      const actor = Actor.getById(id);

      if (actor) {
        if (Array.isArray(opts.aliases)) actor.aliases = opts.aliases;

        if (Array.isArray(opts.labels)) actor.labels = opts.labels;

        if (typeof opts.bookmark == "boolean") actor.bookmark = opts.bookmark;

        if (typeof opts.favorite == "boolean") actor.favorite = opts.favorite;

        if (typeof opts.name == "string") actor.name = opts.name;

        if (typeof opts.thumbnail == "string")
          actor.thumbnail = opts.thumbnail;

        if (typeof opts.rating == "number") actor.rating = opts.rating;

        database
          .get("actors")
          .find({ id: actor.id })
          .assign(actor)
          .write();

        updatedActors.push(actor);
      } else {
        throw new Error(`Actor ${id} not found`);
      }
    }

    return updatedActors;
  },

  removeActors(_, { ids }: { ids: string[] }) {
    for (const id of ids) {
      const actor = Actor.getById(id);

      if (actor) {
        Actor.remove(actor.id);

        Image.filterActor(actor.id);
        Scene.filterActor(actor.id);

        return true;
      }
    }
  }
};
