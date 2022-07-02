import ArrowUp from "mdi-react/ArrowUpIcon";

export type SortDirection = "asc" | "desc";

type Props = {
  value: SortDirection;
  onChange: (x: SortDirection) => void;
  disabled?: boolean;
};

export default function SortDirectionButton({ disabled, value, onChange }: Props) {
  const _disabled = disabled ?? false;
  const ascending = value === "asc";

  function toggle() {
    if (!_disabled) {
      onChange(ascending ? "desc" : "asc");
    }
  }

  return (
    <div
      onClick={toggle}
      className="hover"
      style={{
        cursor: _disabled ? "not-allowed" : "pointer",
        opacity: _disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <ArrowUp
        style={{
          transform: `rotate(${ascending ? 0 : 180}deg)`,
          transition: "all 0.35s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
        size={24}
      />
    </div>
  );
}
