import { gql } from "apollo-server-express";

export default gql`
  type Marker {
    _id: String!
    name: String!
    time: Int!
    rating: Int
    favorite: Boolean
    bookmark: Long

    # Resolvers
    labels: [Label!]!
    thumbnail: Image
    scene: Scene
  }

  type MarkerSearchResults {
    numItems: Int!
    numPages: Int!
    items: [Marker!]!
  }

  extend type Query {
    getMarkers(query: String, seed: String): MarkerSearchResults!
  }

  extend type Mutation {
    createMarker(
      scene: String!
      name: String!
      time: Int!
      rating: Int
      favorite: Boolean
      bookmark: Long
      labels: [String!]
    ): Marker!
    removeMarkers(ids: [String!]!): Boolean!
  }
`;
