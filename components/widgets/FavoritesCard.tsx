import { useTranslations } from "next-intl";
import HeartIcon from "mdi-react/HeartIcon";
import Axios from "axios";
import WidgetCard from "./WidgetCard";
import { useEffect, useState } from "react";
import { IActor } from "../../types/actor";
import ActorGridItem from "../ActorGridItem";
import Button from "../Button";
/* import Button from "@mui/material/Button"; */

async function getActors(skip = 0): Promise<{ actors: IActor[] }> {
  const res = await Axios.post("/api/ql", {
    query: `
      query($skip: Int) {
        topActors(skip: $skip, take: 4) {
          _id
          name
          thumbnail {
            _id
          }
          favorite
          bookmark
        }
      }
    `,
    variables: {
      skip,
    },
  });
  return {
    actors: res.data.data.topActors,
  };
}

export default function FavoritesCard() {
  const t = useTranslations();

  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<IActor[]>([]);

  async function nextPage() {
    const { actors } = await getActors(skip);
    setSkip(skip + 4);
    setItems((prev) => [...prev, ...actors]);
  }

  useEffect(() => {
    nextPage();
  }, []);

  return (
    <WidgetCard icon={<HeartIcon />} title={t("yourFavorites")}>
      <div
        className="list-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: 4,
        }}
      >
        {items.map((actor) => (
          <ActorGridItem
            id={actor._id}
            key={actor._id}
            favorite={actor.favorite}
            name={actor.name}
            thumbnail={actor.thumbnail?._id}
          />
        ))}
      </div>
      <Button style={{ marginTop: 2 }} onClick={nextPage}>
        {t("showMore")}
      </Button>
    </WidgetCard>
  );
}
