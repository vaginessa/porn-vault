import { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function CardTitle({ children, style }: Props) {
  return <div style={{ fontSize: 20, textTransform: "capitalize", ...style }}>{children}</div>;
}
