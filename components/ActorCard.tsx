import Card from "@mui/material/Card";
import Color from "color";

import HeartIcon from "@mui/icons-material/Favorite";
import HeartBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

import Rating from "./Rating";
import { IActor } from "../types/actor";

function thumbnailUrl(thumbnail: string) {
  return `/api/media/image/${thumbnail}/thumbnail?password=xxx`;
}

export default function ActorCard({ actor }: { actor: IActor }) {
  return (
    <Card style={{ position: "relative" }} sx={{ borderRadius: 2 }} variant="outlined">
      <div>
        <img
          style={{ objectFit: "contain", aspectRatio: "3 / 4" }}
          width="100%"
          src={thumbnailUrl(actor.thumbnail?._id || "null")}
        />
      </div>
      <div style={{ position: "absolute", left: 2, top: 2 }}>
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
      <div style={{ margin: "0px 8px 8px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          {actor.nationality && (
            <img
              width="20"
              height="20"
              src={`/assets/flags/${actor.nationality.alpha2.toLowerCase()}.svg`}
            />
          )}
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
          {actor.labels.map((label) => (
            <div
              style={{
                opacity: 0.75,
                fontSize: 12,
                padding: "2px 8px 2px 8px",
                borderRadius: 4,
                display: "inline-block",
                marginRight: 4,
                marginTop: 4,
                background: label.color || "transparent",
                color: new Color(label.color).isLight() ? "black" : "white",
              }}
              key={label._id}
            >
              {label.name}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
