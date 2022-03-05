export interface IActor {
  _id: string;
  name: string;
  thumbnail?: {
    _id: string;
    color?: string;
  };
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  rating: number;
  favorite: boolean;
  bookmark?: boolean;
  age?: number;
  nationality?: {
    name: string;
    alpha2: string;
    nationality: string;
  };
}
