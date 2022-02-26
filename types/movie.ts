export interface IMovie {
  _id: string;
  name: string;
  frontCover?: {
    _id: string;
  };
  duration: number;
}
