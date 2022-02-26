export interface IScene {
  _id: string;
  name: string;
  thumbnail?: {
    _id: string;
  };
  meta: {
    duration: number;
  };
}
