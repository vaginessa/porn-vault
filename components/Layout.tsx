import { useRouter } from "next/router";
import { ReactNode, useContext } from "react";
import { ThemeContext } from "../pages/_app";
import { useTranslations } from "next-intl";
import Link from "next/link";

import SceneIcon from "mdi-react/VideocamIcon";
import ActorIcon from "mdi-react/AccountBoxIcon";
import MovieIcon from "mdi-react/VideoIcon";
import StudioIcon from "mdi-react/CameraAltIcon";
import ImageIcon from "mdi-react/ImageIcon";
import MarkerIcon from "mdi-react/SkipNextIcon";
import Topbar from "./Topbar";

type Props = {
  children: ReactNode;
};

const links = [
  {
    text: "scene",
    icon: <SceneIcon />,
    url: "/scenes",
  },
  {
    text: "actor",
    icon: <ActorIcon />,
    url: "/actors",
  },
  {
    text: "movie",
    icon: <MovieIcon />,
    url: "/movies",
  },
  {
    text: "studio",
    icon: <StudioIcon />,
    url: "/studios",
  },
  {
    text: "image",
    icon: <ImageIcon />,
    url: "/images",
  },
  {
    text: "marker",
    icon: <MarkerIcon />,
    url: "/markers",
  },
];

export default function Layout({ children }: Props): JSX.Element {
  const { toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const t = useTranslations();

  function switchLocale(locale: string): void {
    router.push("", {}, { locale });
  }

  return (
    <div className="layout">
      <Topbar />
      <div className="sidebar">
        <div className="inner">
          <div style={{ padding: 8 }}>
            {links.map((link) => (
              <Link key={link.url} href={link.url} passHref>
                <a>
                  <div className="hover link">
                    {link.icon}
                    <span style={{ opacity: 0.8 }}>{t(link.text, { numItems: 2 })}</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={toggleTheme}>Toggle theme</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <div style={{ marginTop: 4, gap: 8, display: "flex", justifyContent: "center" }}>
              <img
                className="hover"
                onClick={() => switchLocale("en")}
                src="/assets/flags/us.svg"
                width="24"
                height="24"
              />
              <img
                className="hover"
                onClick={() => switchLocale("de")}
                src="/assets/flags/de.svg"
                width="24"
                height="24"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
