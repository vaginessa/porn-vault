import gql from "graphql-tag";

export default gql`
  fragment SceneFragment on Scene {
    id
    name
    releaseDate
    description
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
    path
  }
`;
