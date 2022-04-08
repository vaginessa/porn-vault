import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";
import Paper from "./Paper";
import styles from "./Card.module.scss";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function Card({ children, className, style }: Props) {
  return (
    <Paper className={clsx(className, styles.card)} style={{ ...style }}>
      {/* TODO: card body component (flex col) */}
      {children}
    </Paper>
  );
}
