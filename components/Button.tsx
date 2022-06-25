import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.module.scss";
import Loader from "./Loader";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  loading?: boolean;
};

export default function Button({ children, onClick, style, className, loading }: Props) {
  return (
    <button
      onClick={() => onClick?.()}
      style={style || {}}
      className={clsx(styles.button, className)}
    >
      {loading ? <Loader /> : children}
    </button>
  );
}
