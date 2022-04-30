import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props): JSX.Element {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  function toggleSidebar() {
    setMobileSidebar(!mobileSidebar);
  }

  return (
    <div className="layout">
      <Topbar toggleSidebar={toggleSidebar} />
      <Sidebar active={mobileSidebar} toggleSidebar={toggleSidebar} />
      <div className="content">{children}</div>
    </div>
  );
}
