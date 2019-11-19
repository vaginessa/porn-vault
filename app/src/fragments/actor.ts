import gql from "graphql-tag";

export default gql`
  fragment ActorFragment on Actor {
    id
    name
    aliases
    rating
    favorite
    bookmark
    labels {
      id
      name
    }
    thumbnail {
      id
    }
  }
`;
