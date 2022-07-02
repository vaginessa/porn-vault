import { useContext } from "react";

import { ThemeContext } from "../pages/_app";
import { IActor } from "../types/actor";
import { thumbnailUrl } from "../util/thumbnail";
import Paper from "./Paper";

type Props = {
  items: IActor[];
  selected: string[];
  onChange?: (x: string[]) => void;
};

export default function CollabSelector({ items, selected, onChange }: Props) {
  const { theme } = useContext(ThemeContext);

  function isSelected(actorId: string): boolean {
    return selected.includes(actorId);
  }

  return (
    <>
      {items.map((x) => (
        <Paper
          onClick={() => {
            if (isSelected(x._id)) {
              onChange?.(selected.filter((y) => y !== x._id));
            } else {
              onChange?.([...selected, x._id]);
            }
          }}
          className="hover"
          key={x._id}
          style={{
            border: "none",
            padding: "5px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: isSelected(x._id)
              ? theme === "dark"
                ? "#303350"
                : "#ccddff"
              : theme === "dark"
              ? "#1C1C25"
              : "white",
          }}
        >
          <img
            style={{ borderRadius: "45%", objectFit: "cover" }}
            width="40"
            height="40"
            src={thumbnailUrl(x.avatar?._id)}
            alt={x.name}
          />
          <div style={{ opacity: 0.8, fontSize: 16, fontWeight: 500 }}>{x.name}</div>
        </Paper>
      ))}
    </>
  );
}
