import { useTranslations } from "next-intl";
import SettingsIcon from "@mui/icons-material/Settings";
import Axios from "axios";
import WidgetCard from "./WidgetCard";
import { useEffect, useState } from "react";
import Loader from "../Loader";

async function getQueueStats() {
  const { data } = await Axios.post("/api/ql", {
    query: `
{ 
  getQueueInfo {    
    length 
    processing 
  }
}
    `,
  });
  return data.data.getQueueInfo;
}

export default function LibraryTimeCard() {
  const t = useTranslations();

  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getQueueStats().then((info) => {
      setActive(info.processing);
      setCount(info.length);
    });
  }, []);

  return (
    <WidgetCard icon={<SettingsIcon />} title={t("videoProcessingQueue")}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          {t("video", {
            numItems: count,
          })}
        </div>
        {active && <Loader />}
      </div>
    </WidgetCard>
  );
}
