import { updateActors } from "../search/actor";
import { updateImages } from "../search/image";
import { updateScenes } from "../search/scene";
import { updateStudios } from "../search/studio";
import Actor from "../types/actor";
import Image from "../types/image";
import LabelledItem from "../types/labelled_item";
import Scene from "../types/scene";
import Studio from "../types/studio";
import ActorMutations from "./mutations/actor";
import CustomFieldMutations from "./mutations/custom_field";
import ImageMutations from "./mutations/image";
import LabelMutations from "./mutations/label";
import MarkerMutations from "./mutations/marker";
import MovieMutations from "./mutations/movie";
import SceneMutations from "./mutations/scene";
import StudioMutations from "./mutations/studio";

export default {
  ...ImageMutations,
  ...ActorMutations,
  ...LabelMutations,
  ...SceneMutations,
  ...MovieMutations,
  ...StudioMutations,
  ...MarkerMutations,
  ...CustomFieldMutations,
  async removeLabel(_: unknown, { item, label }: { item: string; label: string }) {
    await LabelledItem.remove(item, label);

    if (item.startsWith("sc_")) {
      const scene = await Scene.getById(item);
      if (scene) {
        await updateScenes([scene]);
      }
    } else if (item.startsWith("im_")) {
      const image = await Image.getById(item);
      if (image) {
        await updateImages([image]);
      }
    } else if (item.startsWith("st_")) {
      const studio = await Studio.getById(item);
      if (studio) {
        await updateStudios([studio]);
      }
    } else if (item.startsWith("ac_")) {
      const actor = await Actor.getById(item);
      if (actor) {
        await updateActors([actor]);
      }
    }

    return true;
  },
};
