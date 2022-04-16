import Paper from "./Paper";

export function pagination(current: number, total: number): (number | "...")[] {
  const center: (number | "...")[] = [current - 2, current - 1, current, current + 1, current + 2],
    filteredCenter = center.filter((p) => p > 1 && p < total),
    includeThreeLeft = current === 5,
    includeThreeRight = current === total - 4,
    includeLeftDots = current > 5,
    includeRightDots = current < total - 4;

  if (includeThreeLeft) {
    filteredCenter.unshift(2);
  }
  if (includeThreeRight) {
    filteredCenter.push(total - 1);
  }

  if (includeLeftDots) {
    filteredCenter.unshift("...");
  }
  if (includeRightDots) {
    filteredCenter.push("...");
  }

  return [1, ...filteredCenter, total];
}

type Props = {
  numPages: number;
  current: number;
  onChange?: (page: number) => void;
};

export default function Pagination({ current, numPages, onChange }: Props) {
  const arr = pagination(current, numPages);

  if (numPages < 2) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {arr.map((x, i) => {
        if (x === "...") {
          return (
            <div key={i} style={{ opacity: 0.5 }}>
              ...
            </div>
          );
        }
        return (
          <div key={i} onClick={() => onChange?.(x - 1)}>
            <Paper
              className="hover"
              style={{
                borderColor: current === x - 1 ? "#5555ff" : "transparent",
                borderWidth: 2,
                fontSize: 16,
                borderRadius: 5,
                padding: "5px 0px",
                width: 35,
                textAlign: "center",
              }}
            >
              {x}
            </Paper>
          </div>
        );
      })}
    </div>
  );
}
