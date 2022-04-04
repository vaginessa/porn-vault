export interface IScene {
  _id: string;
  name: string;
  rating: number;
  favorite: boolean;
  bookmark?: boolean;
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
  };
  studio?: {
    _id: string;
    name: string;
  };
}
