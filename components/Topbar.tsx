import { useRouter } from "next/router";
import { useState } from "react";

import { useTranslations } from "next-intl";
import MenuIcon from "mdi-react/HamburgerMenuIcon";

type Props = {
  toggleSidebar: () => void;
};

export default function Topbar({ toggleSidebar }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [searchText, setSearchText] = useState("");

  return (
    <div className="topbar">
      <div style={{ width: "100%", display: "flex", alignItems: "center", padding: 12, gap: 8 }}>
        <MenuIcon onClick={toggleSidebar} className="mobile-sidebar-toggle" />
        <img
          onClick={() => router.push("/")}
          className="hover"
          width={36}
          height={36}
          src="/assets/favicon.png"
        />
        <div style={{ flexGrow: 1 }}></div>
        <input
          type="text"
          placeholder={t("findContent")}
          value={searchText}
          onChange={(ev) => setSearchText(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              router.push(`/search?q=${searchText}`);
            }
          }}
        />
      </div>
    </div>
  );
}
