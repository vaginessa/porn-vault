import type { ReactNode } from "react";
import Card from "../Card";

type Props = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

export default function WidgetCard({ children, icon, title }: Props) {
  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
        {icon} <span style={{ fontSize: 18 }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </Card>
  );
}
