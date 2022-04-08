import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export default function CardSection({ title, children }: Props) {
  return (
    <div>
      <div style={{ opacity: 0.8, marginBottom: 5, textTransform: "capitalize" }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}
