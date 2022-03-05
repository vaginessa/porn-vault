import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
};

export default function Button({ children, onClick, style, className }: Props) {
  return (
    <button onClick={() => onClick?.()} style={style || {}} className={clsx("pv-btn", className)}>
      {children}
    </button>
  );
}
