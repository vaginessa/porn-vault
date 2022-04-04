import { IScene } from "../types/scene";
import Card from "./Card";
import Link from "next/link";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Rating from "./Rating";
import LabelGroup from "./LabelGroup";
import { thumbnailUrl } from "../util/thumbnail";
import { formatDuration } from "../util/string";

export default function SceneCard({ scene }: { scene: IScene }) {
  return (
    <Card style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Link href={`/scene/${scene._id}`} passHref>
          <a style={{ display: "block" }} className="hover">
            <img
              style={{ objectFit: "cover", aspectRatio: "4 / 3" }}
              width="100%"
              src={thumbnailUrl(scene.thumbnail?._id || "null")}
            />
          </a>
        </Link>
        <div
          style={{
            display: "flex",
            gap: 2,
            fontSize: 14,
            fontWeight: "bold",
            color: "white",
            position: "absolute",
            right: 5,
            bottom: 5,
          }}
        >
          <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
            {formatDuration(scene.meta.duration)}
          </div>
        </div>
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
        {scene.favorite ? (
          <HeartIcon style={{ fontSize: 28, color: "#ff3355" }} />
        ) : (
          <HeartBorderIcon style={{ fontSize: 28 }} />
        )}
        {scene.bookmark ? (
          <BookmarkIcon style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon style={{ fontSize: 28 }} />
        )}
      </div>
      <div style={{ margin: "4px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {scene.studio && (
            <div
              style={{ textTransform: "uppercase", marginBottom: 5, fontSize: 13, opacity: 0.8 }}
            >
              {scene.studio.name}
            </div>
          )}
          <div style={{ flexGrow: 1 }}></div>
          {scene.releaseDate && (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {new Date(scene.releaseDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {scene.name}
          </div>
        </div>

        <div style={{ marginTop: 5 }}>
          <Rating value={scene.rating || 0} readonly />
        </div>

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={scene.labels} />
        </div>
      </div>
    </Card>
  );
}
