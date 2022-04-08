import { useTranslations } from "next-intl";
import { thumbnailUrl } from "../../util/thumbnail";
import styles from "./ActorProfile.module.scss";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import Rating from "../Rating";
import Flag from "../Flag";

type Props = {
  avatarId?: string;
  nationality?: { alpha2: string };
  actorName: string;
  age?: number;
  bornOn?: number;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
};

export default function ActorProfile(props: Props) {
  const t = useTranslations();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 15,
        position: "relative",
      }}
    >
      <div style={{ position: "relative" }}>
        <img className={styles.avatar} width="125" src={thumbnailUrl(props.avatarId)} />
        {props.nationality && (
          <div
            style={{
              position: "absolute",
              right: -5,
              bottom: 0,
            }}
          >
            <Flag code={props.nationality.alpha2} />
          </div>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div className={styles["actor-name"]}>{props.actorName}</div>
        {props.age && (
          <div
            title={`Born on ${new Date(props.bornOn!).toLocaleDateString()}`}
            style={{ fontSize: 14, opacity: 0.66 }}
          >
            {t("yearsOld", { age: props.age })}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <div>
          {props.favorite ? (
            <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
          ) : (
            <HeartBorderIcon style={{ fontSize: 32 }} />
          )}
        </div>
        <div>
          {props.bookmark ? (
            <BookmarkIcon style={{ fontSize: 32 }} />
          ) : (
            <BookmarkBorderIcon style={{ fontSize: 32 }} />
          )}
        </div>
      </div>
      <Rating value={props.rating} readonly />
    </div>
  );
}
