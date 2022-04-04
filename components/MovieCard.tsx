import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Card from "./Card";
import Rating from "./Rating";
import Link from "next/link";
import LabelGroup from "./LabelGroup";
import { IMovie } from "../types/movie";
import { useState } from "react";
import { thumbnailUrl } from "../util/thumbnail";
import { useTranslations } from "next-intl";
import { formatDuration } from "../util/string";

export default function MovieCard({ movie }: { movie: IMovie }) {
  const t = useTranslations();
  const [hover, setHover] = useState(false);

  return (
    <Card style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Link href={`/movie/${movie._id}`} passHref>
          <a style={{ display: "block" }} className="hover">
            <img
              onMouseLeave={() => setHover(false)}
              onMouseEnter={() => setHover(true)}
              style={{ objectFit: "contain", aspectRatio: "3 / 4" }} // TODO: for some reason aspect-ratio is not working correctly here
              width="100%"
              src={
                hover
                  ? thumbnailUrl(movie.backCover?._id || "null")
                  : thumbnailUrl(movie.frontCover?._id || "null")
              }
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
            {movie.scenes.length} {t("scene", { numItems: movie.scenes.length })}
          </div>
          {movie.duration && (
            <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
              {formatDuration(movie.duration)}
            </div>
          )}
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
        {movie.favorite ? (
          <HeartIcon style={{ fontSize: 28, color: "#ff3355" }} />
        ) : (
          <HeartBorderIcon style={{ fontSize: 28 }} />
        )}
        {movie.bookmark ? (
          <BookmarkIcon style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon style={{ fontSize: 28 }} />
        )}
      </div>
      <div style={{ margin: "4px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {movie.studio && (
            <div
              style={{ textTransform: "uppercase", marginBottom: 5, fontSize: 13, opacity: 0.8 }}
            >
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

        <div style={{ marginTop: 5 }}>
          <Rating value={movie.rating || 0} readonly />
        </div>

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={movie.labels} />
        </div>
      </div>
    </Card>
  );
}
