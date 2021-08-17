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
    size
    dimensions {
      width
      height
    }
  }
  watches
  availableFields {
    _id
    name
    type
    unit
  }
  customFields
}
`;
