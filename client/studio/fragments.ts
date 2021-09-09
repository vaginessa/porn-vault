export const studioCardFragment = `
fragment StudioCard on Studio {
  _id
  name
  favorite
  bookmark
  numScenes
  thumbnail {
    _id
    color
  }
  parent {
    _id
    name
  }
  labels {
    _id
    name
    color
  }
}
`;
