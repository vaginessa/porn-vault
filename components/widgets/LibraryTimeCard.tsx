import { useTranslations } from "next-intl";
import TimeIcon from "mdi-react/TimelapseIcon";
import Axios from "axios";
import WidgetCard from "./WidgetCard";
import { useEffect, useState } from "react";

async function getWatchStats() {
  const res = await Axios.get<{
    numViews: number;
    numScenes: number;
    viewedPercent: number;
    remaining: number;
    remainingSeconds: number;
    remainingDays: number;
    remainingMonths: number;
    remainingYears: number;
    remainingTimestamp: number;
    currentInterval: number;
    currentIntervalDays: number;
  }>("/api/remaining-time");
  return res.data;
}

export default function LibraryTimeCard() {
  const t = useTranslations();

  const [numViews, setViews] = useState(0);
  const [numDays, setDays] = useState(0);
  const [percent, setPercent] = useState(0);
  const [years, setYears] = useState(0);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    getWatchStats().then((data) => {
      setViews(data.numViews);
      setDays(+data.currentIntervalDays.toFixed(0));
      setPercent(data.viewedPercent);
      setYears(data.remainingYears);
      setDate(new Date(data.remainingTimestamp));
    });
  }, []);

  return (
    <WidgetCard icon={<TimeIcon />} title={t("libraryTime")}>
      <div>
        {t("viewsInDays", {
          numViews,
          numDays,
        })}
      </div>
      <div>
        {t("percentWatched", {
          percent: `${(percent * 100).toFixed(1)}%`,
        })}
      </div>
      <div>
        {t("contentLeft", {
          years: years.toFixed(1),
        })}
      </div>
      <div>
        {t("runningOut", {
          date: date.toLocaleDateString(),
        })}
      </div>
    </WidgetCard>
  );
}
