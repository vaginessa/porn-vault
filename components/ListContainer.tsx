import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  size?: number;
};

export default function ListContainer({ children, size }: Props): JSX.Element {
  return (
    <div
      className="list-container"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${size || 200}px, 1fr))`,
        gridGap: 5,
      }}
    >
      {children}
    </div>
  );
}
