import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  size?: number;
  gap?: number;
};

export default function ListContainer({ children, size, gap }: Props): JSX.Element {
  return (
    <div
      className="list-container"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${size || 200}px, 1fr))`,
        gridGap: gap || 5,
      }}
    >
      {children}
    </div>
  );
}
