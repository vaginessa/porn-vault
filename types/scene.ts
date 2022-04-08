import { IMovie } from "./movie";

export interface IScene {
  _id: string;
  name: string;
  description?: string;
  rating: number;
  favorite: boolean;
  bookmark: boolean;
  releaseDate?: number;
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  thumbnail?: {
    _id: string;
    color?: string;
  };
  meta: {
    duration: number;
    dimensions: {
      width: number;
      height: number;
    };
    size: number;
    fps: number;
  };
  actors: {
    _id: string;
    name: string;
    thumbnail?: {
      _id: string;
    };
    favorite: boolean;
  }[];
  movies: IMovie[];
  studio?: {
    _id: string;
    name: string;
    thumbnail?: {
      _id: string;
    };
  };
  markers: {
    _id: string;
    name: string;
    time: number;
    thumbnail?: {
      _id: string;
    };
  }[];
  path: string;
  watches: number[];
}
