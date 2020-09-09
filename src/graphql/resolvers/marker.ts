import Image from "../../types/image";
import Label from "../../types/label";
import Marker from "../../types/marker";
import Scene from "../../types/scene";

export default {
  async labels(marker: Marker): Promise<Label[]> {
    return await Marker.getLabels(marker);
  },
  async thumbnail(marker: Marker): Promise<Image | null> {
    if (marker.thumbnail) return await Image.getById(marker.thumbnail);
    return null;
  },
  async scene(marker: Marker): Promise<Scene | null> {
    return Scene.getById(marker.scene);
  },
};
