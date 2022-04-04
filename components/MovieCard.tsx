import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Card from "./Card";
import Rating from "./Rating";
import Link from "next/link";
import LabelGroup from "./LabelGroup";
import { IMovie } from "../types/movie";
import moment from "moment";
import { useState } from "react";
import { thumbnailUrl } from "../util/thumbnail";

function movieDuration(secs: number): string {
  return moment()
    .startOf("day")
    .seconds(secs)
    .format(secs < 3600 ? "mm:ss" : "H:mm:ss");
}

export default function MovieCard({ movie }: { movie: IMovie }) {
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
            fontSize: 14,
            fontWeight: "bold",
            color: "white",
            background: "#000000dd",
            borderRadius: 5,
            padding: "2px 5px",
            position: "absolute",
            right: 5,
            bottom: 5,
          }}
        >
          {movieDuration(movie.duration)}
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
