import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Axios from "axios";

export default function Topbar() {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    Axios.get("/api/version").then((res) => {
      setVersion(res.data.result);
    });
  }, []);

  return (
    <div className="topbar">
      <div style={{ width: "100%", display: "flex", alignItems: "center", padding: 12, gap: 4 }}>
        <img
          onClick={() => router.push("/")}
          className="hover"
          width={36}
          height={36}
          src="/assets/favicon.png"
        />
        <div style={{ fontSize: 14, fontWeight: "bold", opacity: 0.75 }}>{version}</div>
        <div style={{ flexGrow: 1 }}></div>
        <input
          type="text"
          placeholder="Search"
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
