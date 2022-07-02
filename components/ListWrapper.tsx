import { ReactNode } from "react";
import ListContainer from "./ListContainer";
import Paper from "./Paper";

type Props = {
  children?: ReactNode;
  loading: boolean;
  noResults: boolean;
};

export default function ListWrapper({ children, loading, noResults }: Props) {
  if (loading) {
    return (
      <ListContainer>
        {[...new Array(10)].map((_, i) => (
          <Paper key={i} className="skeleton-card"></Paper>
        ))}
      </ListContainer>
    );
  }
  if (noResults) {
    return <>No results</>;
  }
  return <ListContainer>{children}</ListContainer>;
}
