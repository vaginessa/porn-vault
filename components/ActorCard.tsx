import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Paper from "./Paper";
import Rating from "./Rating";
import { IActor } from "../types/actor";
import Link from "next/link";
import LabelGroup from "./LabelGroup";
import { thumbnailUrl } from "../util/thumbnail";
import Flag from "./Flag";

export default function ActorCard({ actor }: { actor: IActor }) {
  return (
    <Paper style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Link href={`/actor/${actor._id}`} passHref>
          <a style={{ display: "block" }} className="hover">
            <img
              style={{ objectFit: "cover", aspectRatio: "3 / 4" }}
              width="100%"
              src={thumbnailUrl(actor.thumbnail?._id || "null")}
            />
          </a>
        </Link>
      </div>
      <div
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        {actor.favorite ? (
          <HeartIcon style={{ fontSize: 28, color: "#ff3355" }} />
        ) : (
          <HeartBorderIcon style={{ fontSize: 28 }} />
        )}
        {actor.bookmark ? (
          <BookmarkIcon style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon style={{ fontSize: 28 }} />
        )}
      </div>
      <div style={{ margin: "4px 8px 8px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          {actor.nationality && <Flag size={20} code={actor.nationality.alpha2} />}
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {actor.name}
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <div>{actor.age}</div>
        </div>

        <div style={{ marginTop: 5 }}>
          <Rating value={actor.rating || 0} readonly />
        </div>

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={actor.labels} />
        </div>
      </div>
    </Paper>
  );
}
