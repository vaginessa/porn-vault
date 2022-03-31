import type { ReactNode } from "react";
import Card from "../Card";

type Props = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

export default function WidgetCard({ children, icon, title }: Props) {
  return (
    <Card style={{ padding: 12 }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        {icon} <span style={{ fontSize: 18 }}>{title}</span>
      </div>
      <div>{children}</div>
    </Card>
  );
}
