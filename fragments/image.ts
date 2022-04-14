export const imageCardFragment = `
fragment ImageCard on Image {
  _id
  name
  actors {
    _id
    name
  }
  scene {
    _id
    name
  }
  labels {
    _id
    name
    color
  }
  favorite
  bookmark
  rating
}
`;
