import { useTranslations } from "next-intl";
import StatCard from "./StatCard";

type Props = {
  numScenes: number;
  numWatches: number;
  averageRating: number;
  score: number;
};

export default function ActorStats(props: Props) {
  const t = useTranslations();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: 10,
      }}
    >
      <StatCard title={t("scene", { numItems: 2 })} value={props.numScenes} />
      <StatCard title={t("views", { numItems: 2 })} value={props.numWatches} />
      <StatCard
        title={t("avgRating", { numItems: 2 })}
        value={(props.averageRating / 2).toFixed(1)}
      />
      <StatCard title={t("pvScore", { numItems: 2 })} value={props.score} />
    </div>
  );
}
