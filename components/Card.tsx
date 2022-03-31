import { CSSProperties, ReactNode, useContext } from "react";
import { ThemeContext } from "../pages/_app";
import styles from "./Card.module.scss";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function Card({ children, style }: Props): JSX.Element {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={styles.card}
      style={{
        background: theme === "dark" ? "#1C1C25" : "white",
        borderColor: theme === "dark" ? "#1f1f29" : "#dadada",
        color: theme === "dark" ? "white" : "black",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
