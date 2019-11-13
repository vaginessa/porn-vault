import gql from "graphql-tag";

import actorFragment from "./actor";

export default gql`
  fragment SceneFragment on Scene {
    id
    name
    releaseDate
    description
    rating
    favorite
    bookmark
    actors {
      ...ActorFragment
    }
    labels {
      id
      name
    }
    thumbnail {
      id
    }
    meta {
      size
      duration
      dimensions {
        width
        height
      }
    }
    watches
    streamLinks
  }
  ${actorFragment}
`;
