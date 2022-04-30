import axios from "axios";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Card from "../../components/Card";
import CardTitle from "../../components/CardTitle";
import { IScene } from "../../types/scene";
import { thumbnailUrl } from "../../util/thumbnail";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import CardSection from "../../components/CardSection";
import Rating from "../../components/Rating";
import { formatDuration } from "../../util/string";
import prettyBytes from "pretty-bytes";
import LabelGroup from "../../components/LabelGroup";
import ListContainer from "../../components/ListContainer";
import Paper from "../../components/Paper";
import { useRef, useState } from "react";
import { movieCardFragment } from "../../fragments/movie";
import MovieCard from "../../components/MovieCard";
import Link from "next/link";
import { actorCardFragment } from "../../fragments/actor";
import ActorCard from "../../components/ActorCard";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
      query ($id: String!) {
        getSceneById(id: $id) {
          _id
          name
          favorite
          bookmark
          rating
          description
          releaseDate
          labels {
            _id
            name
            color
          }
          thumbnail {
            _id
          }
          meta {
            duration
            fps
            size
            dimensions {
              width
              height
            }
          }
          actors {
            ...ActorCard
          }
          movies {
            ...MovieCard
          }
          studio {
            _id
            name
            thumbnail {
              _id
            }
          }
          path
          watches
          markers {
            _id
            name
            time
            thumbnail {
              _id
            }
          }
        }
      }
      ${actorCardFragment}
      ${movieCardFragment}
      `,
      variables: {
        id: ctx.query.id,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    props: {
      scene: data.data.getSceneById,
    },
  };
};

export default function ScenePage({ scene }: { scene: IScene }) {
  const t = useTranslations();

  const videoEl = useRef<HTMLVideoElement | null>(null);

  const [rating, setRating] = useState(scene.rating);
  const [markers] = useState(scene.markers);

  return (
    <div>
      <Head>
        <title>{scene.name}</title>
      </Head>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#05050a",
        }}
      >
        <div style={{ maxWidth: 1000 }}>
          <video
            ref={videoEl}
            poster={thumbnailUrl(scene.thumbnail?._id)}
            controls
            src={`/api/media/scene/${scene._id}`}
            width="100%"
            height="100%"
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 1000,
            padding: 10,
            gap: 20,
            flexDirection: "column",
          }}
        >
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                {scene.favorite ? (
                  <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
                ) : (
                  <HeartBorderIcon style={{ fontSize: 32 }} />
                )}
              </div>
              <div>
                {scene.bookmark ? (
                  <BookmarkIcon style={{ fontSize: 32 }} />
                ) : (
                  <BookmarkBorderIcon style={{ fontSize: 32 }} />
                )}
              </div>
              <div style={{ flexGrow: 1 }} />
              {!!scene.studio && (
                <img
                  height="32"
                  src={thumbnailUrl(scene.studio.thumbnail?._id)}
                  alt={`${scene.studio.name} Logo`}
                />
              )}
            </div>
          </Card>
          <Card>
            <CardTitle>{t("general")}</CardTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                /* TODO: flex col card body component */
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <CardSection title={t("title")}>
                  <div style={{ opacity: 0.66 }}>{scene.name}</div>
                </CardSection>
                {!!scene.studio && (
                  <CardSection title={t("studio", { numItems: 2 })}>
                    <div style={{ opacity: 0.66 }}>
                      <Link href={`/studio/${scene.studio._id}`}>
                        <a>{scene.studio.name}</a>
                      </Link>
                    </div>
                  </CardSection>
                )}
                {scene.releaseDate && (
                  <CardSection title={t("releaseDate")}>
                    <div style={{ opacity: 0.66 }}>
                      {new Date(scene.releaseDate).toLocaleDateString()}
                    </div>
                  </CardSection>
                )}
                {scene.description && (
                  <CardSection title={t("description")}>
                    <pre
                      style={{
                        opacity: 0.66,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      {scene.description}
                    </pre>
                  </CardSection>
                )}
                <CardSection title={t("rating")}>
                  <Rating
                    onChange={(rating) => {
                      // TODO: mutation
                      setRating(rating);
                    }}
                    readonly={false}
                    value={rating}
                  ></Rating>
                </CardSection>
                <CardSection title={t("labels", { numItems: 2 })}>
                  <LabelGroup limit={999} labels={scene.labels} />
                </CardSection>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <CardSection title={t("videoDuration")}>
                  <div style={{ opacity: 0.66 }}>{formatDuration(scene.meta.duration)}</div>
                </CardSection>
                <CardSection title={t("path")}>
                  <div style={{ opacity: 0.66 }}>{scene.path}</div>
                </CardSection>
                <CardSection title={t("fileSize")}>
                  <div title={`${scene.meta.size} bytes`} style={{ opacity: 0.66 }}>
                    {prettyBytes(scene.meta.size)}
                  </div>
                </CardSection>
                <CardSection title={t("videoDimensions")}>
                  <div style={{ opacity: 0.66 }}>
                    {scene.meta.dimensions.width}x{scene.meta.dimensions.height}
                  </div>
                </CardSection>
                <CardSection title={t("fps")}>
                  <div style={{ opacity: 0.66 }}>{scene.meta.fps}</div>
                </CardSection>
                <CardSection title={t("bitrate")}>
                  <div style={{ opacity: 0.66 }}>
                    {((scene.meta.size / 1000 / scene.meta.duration) * 8).toFixed(0)} kBit/s
                  </div>
                </CardSection>
              </div>
            </div>
          </Card>
          {!!scene.actors.length && (
            <Card>
              <CardTitle>{t("starring")}</CardTitle>
              <ListContainer size={175}>
                {scene.actors.map((actor) => (
                  <ActorCard key={actor._id} actor={actor}></ActorCard>
                ))}
              </ListContainer>
            </Card>
          )}
          {!!scene.movies.length && (
            <Card>
              <CardTitle>{t("movieFeatures")}</CardTitle>
              <ListContainer size={225}>
                {scene.movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie}></MovieCard>
                ))}
              </ListContainer>
            </Card>
          )}
          {!!markers.length && (
            <Card>
              <CardTitle>{t("marker", { numItems: 2 })}</CardTitle>
              <ListContainer size={275}>
                {markers
                  .sort((a, b) => a.time - b.time)
                  .map((marker) => (
                    <Paper>
                      <img
                        onClick={() => {
                          if (videoEl.current) {
                            videoEl.current.currentTime = marker.time;
                            window.scrollTo({
                              left: 0,
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className="hover"
                        width="100%"
                        height="100%"
                        style={{ objectFit: "cover" }}
                        src={thumbnailUrl(marker.thumbnail?._id)}
                        alt={marker.name}
                      />
                    </Paper>
                  ))}
              </ListContainer>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
