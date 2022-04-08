export interface IMovie {
  _id: string;
  name: string;
  frontCover?: {
    _id: string;
  };
  backCover?: {
    _id: string;
  };
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  duration: number;
  rating: number;
  favorite: boolean;
  bookmark: boolean;
  releaseDate?: number;
  studio?: {
    _id: string;
    name: string;
  };
  scenes: {
    _id: string;
  }[];
}
