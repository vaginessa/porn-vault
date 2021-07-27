export const studioCardFragment = `
fragment StudioCard on Studio {
  _id
  name
  favorite
  bookmark
  thumbnail {
    _id
    color
  }
  parent {
    _id
    name
  }
}
`;
