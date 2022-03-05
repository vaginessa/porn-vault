export interface IScene {
  _id: string;
  name: string;
  thumbnail?: {
    _id: string;
    color?: string;
  };
  meta: {
    duration: number;
  };
}
