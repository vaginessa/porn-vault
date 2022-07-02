import Star from "mdi-react/StarIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import StarOutline from "mdi-react/StarBorderIcon";

type RatingProps = {
  value: number;
  readonly?: boolean;
  onChange?: (x: number) => void;
};

export default function Rating({ value, readonly, onChange }: RatingProps) {
  const fav = value === 10;
  const _readonly = readonly ?? false;

  function onClick(ev: React.MouseEvent<any>, index: number) {
    if (_readonly) {
      return;
    }

    const clickTarget = ev.target as HTMLElement;
    const clickTargetWidth = clickTarget.getBoundingClientRect().width;
    const xCoordInClickTarget = ev.nativeEvent.offsetX;

    let computedValue;
    if (clickTargetWidth / 2 > xCoordInClickTarget) {
      // clicked left
      computedValue = index * 2 - 1;
    } else {
      // clicked right
      computedValue = index * 2;
    }

    if (value == computedValue) {
      onChange?.(0);
    } else {
      onChange?.(computedValue);
    }
  }

  function renderStar(index: number) {
    if (index * 2 <= (value || 0)) {
      return (
        <Star
          onClick={(ev) => onClick(ev, index)}
          key={index}
          style={{
            color: fav ? "#ff3355" : "#4488ff",
            cursor: _readonly ? "not-allowed" : "pointer",
          }}
        />
      );
    }
    if (value && value % 2 == 1 && index * 2 == value + 1) {
      return (
        <StarHalf
          onClick={(ev) => onClick(ev, index)}
          key={index}
          style={{ color: "#4488ff", cursor: _readonly ? "not-allowed" : "pointer" }}
        />
      );
    }
    return <StarOutline onClick={(ev) => onClick(ev, index)} key={index} opacity={0.5} />;
  }

  return (
    <div style={{ display: "inline-flex", cursor: _readonly ? "not-allowed" : "pointer" }}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
}
