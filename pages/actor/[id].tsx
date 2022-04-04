import axios from "axios";
import { GetServerSideProps } from "next";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

import Card from "../../components/Card";
import LabelGroup from "../../components/LabelGroup";
import { actorCardFragment } from "../../fragments/actor";
import { thumbnailUrl } from "../../util/thumbnail";
import { useEffect, useState } from "react";
import { useSceneList } from "../../composables/use_scene_list";
import ListContainer from "../../components/ListContainer";
import Loader from "../../components/Loader";
import SceneCard from "../../components/SceneCard";
import Rating from "../../components/Rating";
import { IActor } from "../../types/actor";
import { useTranslations } from "next-intl";
import Pagination from "../../components/Pagination";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
      query ($id: String!) {
        getActorById(id: $id) {
          ...ActorCard
          bornOn
          aliases
          averageRating
          score
          numScenes
          labels {
            _id
            name
            color
          }
          thumbnail {
            _id
            color
          }
          altThumbnail {
            _id
          }
          watches
          hero {
            _id
            color
          }
          avatar {
            _id
            color
          }
        }
      }
      ${actorCardFragment}
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
      actor: data.data.getActorById,
    },
  };
};

export default function ActorPage({ actor }: { actor: IActor }) {
  const t = useTranslations();
  const [scenePage, setScenePage] = useState(0);
  const {
    scenes,
    fetchScenes,
    numItems: numScenes,
    numPages: numScenePages,
    loading: sceneLoader,
  } = useSceneList(
    {
      items: [],
      numItems: 0,
      numPages: 0,
    },
    { actors: [actor._id] }
  );

  useEffect(() => {
    fetchScenes(scenePage);
  }, []);

  async function onScenePageChange(x: number): Promise<void> {
    setScenePage(x);
    fetchScenes(x);
  }

  return (
    <div>
      {actor.hero && (
        <div style={{ position: "relative" }}>
          <img
            width="100%"
            style={{ aspectRatio: String(2.75) }}
            src={`/api/media/image/${actor.hero._id}?password=null`}
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
        <div className="actor-page-cols">
          <div style={{ gridArea: "left" }}>
            <Card
              className="actor-left-col"
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 15,
                padding: "20px 5px",
                boxShadow: "0px 5px 15px -5px rgba(0,0,50,0.15)",
              }}
            >
              <img
                style={{
                  borderRadius: "50%",
                  border: "4px solid grey",
                }}
                width="125"
                src={thumbnailUrl(actor.avatar?._id)}
              />
              <div style={{ textAlign: "center" }}>
                <div className="actor-name">{actor.name}</div>
                {actor.age && (
                  <div
                    title={`Born on ${new Date(actor.bornOn!).toLocaleDateString()}`}
                    style={{ fontSize: 14, opacity: 0.66 }}
                  >
                    {t("yearsOld", { age: actor.age })}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <div>
                  {actor.favorite ? (
                    <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
                  ) : (
                    <HeartBorderIcon style={{ fontSize: 32 }} />
                  )}
                </div>
                <div>
                  {actor.bookmark ? (
                    <BookmarkIcon style={{ fontSize: 32 }} />
                  ) : (
                    <BookmarkBorderIcon style={{ fontSize: 32 }} />
                  )}
                </div>
              </div>
              <Rating value={actor.rating} readonly />
            </Card>
          </div>
          <div style={{ gridArea: "right" }}>
            <Card
              style={{
                padding: 10,
                boxShadow: "0px 5px 15px -5px rgba(0,0,50,0.15)",
                marginBottom: 10,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 20 }}>{t("stats")}</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 10,
                    textAlign: "center",
                    padding: 10,
                    border: "1px solid #90909050",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 5 }}>
                    {actor.numScenes}
                  </div>
                  <div>{t("scene", { numItems: 2 })}</div>
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    textAlign: "center",
                    padding: 10,
                    border: "1px solid #90909050",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 5 }}>
                    {actor.watches.length}
                  </div>
                  <div>{t("views", { numItems: actor.watches.length })}</div>
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    textAlign: "center",
                    padding: 10,
                    border: "1px solid #90909050",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 5 }}>
                    {(actor.averageRating / 2).toFixed(1)}
                  </div>
                  <div>{t("avgRating")}</div>
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    textAlign: "center",
                    padding: 10,
                    border: "1px solid #90909050",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 5 }}>
                    {actor.score}
                  </div>
                  <div>{t("pvScore")}</div>
                </div>
              </div>
            </Card>
            <Card
              style={{
                padding: 10,
                boxShadow: "0px 5px 15px -5px rgba(0,0,50,0.15)",
                marginBottom: 10,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 20, textTransform: "capitalize" }}>
                {t("general")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {!!actor.aliases.length && (
                  <div>
                    <div style={{ marginBottom: 5, textTransform: "capitalize" }}>
                      {t("aliases")}
                    </div>
                    <div style={{ opacity: 0.66 }}>
                      {actor.aliases.filter((x) => !x.startsWith("regex:")).join(", ")}
                    </div>
                  </div>
                )}
                {actor.description && (
                  <div>
                    <div style={{ marginBottom: 5 }}>Description</div>
                    <div style={{ opacity: 0.66 }}>{actor.description}</div>
                  </div>
                )}
                <div>
                  <div style={{ marginBottom: 5, textTransform: "capitalize" }}>
                    {t("labels", { numItems: 2 })}
                  </div>
                  <div>
                    <LabelGroup labels={actor.labels} />
                  </div>
                </div>
              </div>
            </Card>
            {
              <div
                style={{
                  padding: 10,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 20 }}>
                  {numScenes} {t("scene", { numItems: numScenes })}
                </div>
                {sceneLoader ? (
                  <div style={{ textAlign: "center" }}>
                    <Loader />
                  </div>
                ) : (
                  <div>
                    <ListContainer size={250}>
                      {scenes.map((scene) => (
                        <SceneCard key={scene._id} scene={scene} />
                      ))}
                    </ListContainer>
                    <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                      <Pagination
                        numPages={numScenePages}
                        current={scenePage}
                        onChange={onScenePageChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
