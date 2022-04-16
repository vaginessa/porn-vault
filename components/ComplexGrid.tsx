import clsx from "clsx";
import { ReactNode } from "react";
import styles from "./ComplexGrid.module.scss";

type Props = {
  leftChildren: ReactNode;
  rightChildren: ReactNode;
  negativeTop: boolean;
};

export default function ComplexGrid({ leftChildren, rightChildren, negativeTop }: Props) {
  return (
    <div className={clsx(styles["complex-grid"], { [styles["negative-top"]]: negativeTop })}>
      <div style={{ gridArea: "left" }}>
        <div className={clsx(styles["complex-grid-left-sticky"])}>{leftChildren}</div>
      </div>
      <div style={{ gridArea: "right" }}>{rightChildren}</div>
    </div>
  );
}
