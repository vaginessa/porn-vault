export const actorCardFragment = `
fragment ActorCard on Actor {
  _id
  name
  age
  rating
  favorite
  bookmark
  thumbnail {
    _id
    color
  }
  labels {
    _id
    name
    color
  }
  nationality {
    name
    alpha2
    nationality
  }
}
`;
