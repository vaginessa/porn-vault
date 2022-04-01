import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ListContainer({ children }: Props): JSX.Element {
  return (
    <div
      className="list-container"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gridGap: 8,
      }}
    >
      {children}
    </div>
  );
}
