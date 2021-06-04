export const sceneCardFragment = `
fragment SceneCard on Scene {
  _id
  name
  releaseDate
  favorite
  bookmark
  rating
  thumbnail {
    _id
    color
  }
  labels {
    _id
    name
    color
  }
  actors {
    _id
    name
  }
  studio {
    _id
    name
  }
  meta {
    duration
  }
  watches
}
`;
