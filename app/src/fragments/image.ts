import gql from "graphql-tag";

export default gql`
  fragment ImageFragment on Image {
    id
    name
    labels {
      id
      name
    }
    bookmark
    favorite
    rating
  }
`;
