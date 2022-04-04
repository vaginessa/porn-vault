import clsx from "clsx";
import { CSSProperties, ReactNode, useContext } from "react";
import { ThemeContext } from "../pages/_app";
import styles from "./Card.module.scss";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function Card({ children, style, className }: Props): JSX.Element {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={clsx(className, styles.card)}
      style={{
        background: theme === "dark" ? "#1C1C25" : "white",
        borderColor: theme === "dark" ? "#2e2e3b" : "#dadada",
        color: theme === "dark" ? "white" : "black",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
