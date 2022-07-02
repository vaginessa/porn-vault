import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Paper from "./Paper";
import Rating from "./Rating";
import Link from "next/link";
import LabelGroup from "./LabelGroup";
import { IMovie } from "../types/movie";
import { useState } from "react";
import { thumbnailUrl } from "../util/thumbnail";
import { useTranslations } from "next-intl";
import { formatDuration } from "../util/string";
import ActorList from "./ActorList";
import ResponsiveImage from "./ResponsiveImage";

export default function MovieCard({ movie }: { movie: IMovie }) {
  const t = useTranslations();
  const [hover, setHover] = useState(false);

  const thumb = hover ? movie.backCover?._id : movie.frontCover?._id;

  return (
    <Paper style={{ position: "relative" }}>
      <div onMouseLeave={() => setHover(false)} onMouseEnter={() => setHover(true)}>
        <ResponsiveImage
          aspectRatio="0.71"
          href={`/movie/${movie._id}`}
          src={thumb && thumbnailUrl(thumb)}
        >
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
              {movie.scenes.length} {t("scene", { numItems: movie.scenes.length })}
            </div>
            {movie.duration && (
              <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
                {formatDuration(movie.duration)}
              </div>
            )}
          </div>
        </ResponsiveImage>
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
        <div className="hover">
          {movie.favorite ? (
            <HeartIcon style={{ fontSize: 28, color: "#ff3355" }} />
          ) : (
            <HeartBorderIcon style={{ fontSize: 28 }} />
          )}
        </div>
        <div className="hover">
          {movie.bookmark ? (
            <BookmarkIcon style={{ fontSize: 28 }} />
          ) : (
            <BookmarkBorderIcon style={{ fontSize: 28 }} />
          )}
        </div>
      </div>
      <div style={{ margin: "4px 8px 8px 8px" }}>
        <div style={{ display: "flex", marginBottom: 5 }}>
          {movie.studio && (
            <div style={{ textTransform: "uppercase", fontSize: 13, opacity: 0.8 }}>
              {movie.studio.name}
            </div>
          )}
          <div style={{ flexGrow: 1 }}></div>
          {movie.releaseDate && (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {new Date(movie.releaseDate).toLocaleDateString()}
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
            {movie.name}
          </div>
        </div>

        {!!movie.actors.length && <ActorList actors={movie.actors} />}

        <div style={{ marginTop: 5 }}>
          <Rating value={movie.rating || 0} readonly />
        </div>

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={movie.labels} />
        </div>
      </div>
    </Paper>
  );
}
