export interface IActor {
  _id: string;
  name: string;
  thumbnail?: {
    _id: string;
  };
  favorite: boolean;
}
