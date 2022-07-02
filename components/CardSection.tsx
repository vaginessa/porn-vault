import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export default function CardSection({ title, children }: Props) {
  return (
    <div>
      <div
        style={{
          fontWeight: "semibold",
          opacity: 0.9,
          marginBottom: 10,
          textTransform: "capitalize",
          fontSize: 18,
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
