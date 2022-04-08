import Color from "color";

type Props = {
  labels: { _id: string; name: string; color?: string }[];
};

export default function LabelGroup({ labels }: Props): JSX.Element {
  return (
    <div>
      {labels.map((label) => (
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
    </div>
  );
}
