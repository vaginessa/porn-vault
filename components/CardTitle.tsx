import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function CardTitle({ children }: Props) {
  return <div style={{ fontSize: 20, textTransform: "capitalize" }}>{children}</div>;
}
