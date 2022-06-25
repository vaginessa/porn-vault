import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export default function Loader({ style }: Props) {
  return <div style={style}>...</div>;
}
