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

  input MarkerUpdateOpts {
    favorite: Boolean
    bookmark: Long
    actors: [String!]
    name: String
    rating: Int
    labels: [String!]
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
    updateMarkers(ids: [String!]!, opts: MarkerUpdateOpts!): [Marker!]!
    removeMarkers(ids: [String!]!): Boolean!
  }
`;
