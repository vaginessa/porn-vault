import Marker from "../../types/marker";
import Image from "../../types/image";
import Scene from "../../types/scene";

export default {
  async labels(marker: Marker) {
    return await Marker.getLabels(marker);
  },
  async thumbnail(marker: Marker) {
    if (marker.thumbnail) return await Image.getById(marker.thumbnail);
    return null;
  },
  async scene(marker: Marker) {
    return Scene.getById(marker.scene);
  },
};
