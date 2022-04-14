import Color from "color";
import { useState } from "react";

import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";

type Props = {
  labels: { _id: string; name: string; color?: string }[];
  limit?: number;
};

export default function LabelGroup({ labels, limit }: Props): JSX.Element {
  const max = limit || 5;

  const [expanded, setExpanded] = useState(false);

  const slice = expanded ? labels : labels.slice(0, max);

  return (
    <div>
      {slice.map((label) => (
        <div
          style={{
            fontSize: 11,
            padding: "3px 8px 3px 8px",
            borderRadius: 4,
            display: "inline-block",
            marginRight: 4,
            marginTop: 4,
            background: label.color || "#000000dd",
            borderColor: "#80808050",
            borderWidth: 1,
            borderStyle: "solid",
            color: new Color(label.color).isLight() ? "black" : "white",
          }}
          key={label._id}
        >
          {label.name}
        </div>
      ))}
      <div style={{ textAlign: "center" }}>
        {max < labels.length && (
          <div
            style={{
              cursor: "pointer",
              marginTop: 5,
              fontSize: 13,
              fontWeight: "bold",
              opacity: 0.75,
            }}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        )}
      </div>
    </div>
  );
}
