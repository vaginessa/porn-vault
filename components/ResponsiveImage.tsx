import Link from "next/link";
import { ReactNode, useContext, useMemo } from "react";
import { ThemeContext } from "../pages/_app";
import { generateThumbnailPlaceholderColor } from "../util/color";

type Props = {
  src?: string | null;
  aspectRatio: string;
  href?: string | null;
  children?: ReactNode;
};

export default function ResponsiveImage({ href, src, aspectRatio, children }: Props) {
  const { theme } = useContext(ThemeContext);
  const color = useMemo(() => generateThumbnailPlaceholderColor(theme === "dark"), [theme]);

  const inner = src ? (
    <img style={{ objectFit: "cover", aspectRatio }} width="100%" src={src} />
  ) : (
    <div style={{ aspectRatio }}></div>
  );

  const linkContainer = href ? (
    <Link href={href} passHref>
      <a style={{ display: src ? "flex" : "block" }} className="hover">
        {inner}
      </a>
    </Link>
  ) : (
    <div>{inner}</div>
  );

  return (
    <div
      suppressHydrationWarning={true}
      className="hover"
      style={{ backgroundColor: color, position: "relative" }}
    >
      {linkContainer}
      {children}
    </div>
  );
}
