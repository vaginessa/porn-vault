import axios from "axios";
import { GetServerSideProps } from "next";

import Card from "../../components/Card";
import LabelGroup from "../../components/LabelGroup";
import { actorCardFragment } from "../../fragments/actor";
import { thumbnailUrl } from "../../util/thumbnail";
import { useEffect, useState } from "react";
import { useSceneList } from "../../composables/use_scene_list";
import ListContainer from "../../components/ListContainer";
import Loader from "../../components/Loader";
import SceneCard from "../../components/SceneCard";
import { IActor } from "../../types/actor";
import { useTranslations } from "next-intl";
import Pagination from "../../components/Pagination";
import HeroImage from "../../components/actor_details/HeroImage";
import ComplexGrid from "../../components/ComplexGrid";
import ActorProfile from "../../components/actor_details/ActorProfile";
import Head from "next/head";
import ActorStats from "../../components/actor_details/ActorStats";
import CardTitle from "../../components/CardTitle";
import CardSection from "../../components/CardSection";
import { fetchCollabs } from "../../util/collabs";

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
  const [collabs, setCollabs] = useState<IActor[]>([]);

  useEffect(() => {
    fetchScenes(scenePage);
  }, []);

  useEffect(() => {
    (async () => {
      const collabs = await fetchCollabs(actor._id);
      setCollabs(collabs);
    })();
  }, []);

  async function onScenePageChange(x: number): Promise<void> {
    setScenePage(x);
    fetchScenes(x);
  }

  const leftCol = (
    <div>
      <Card style={{ padding: "20px 10px" }}>
        <ActorProfile
          actorName={actor.name}
          age={actor.age}
          bornOn={actor.bornOn}
          avatarId={actor.avatar?._id}
          nationality={actor.nationality}
          rating={actor.rating}
          favorite={actor.favorite}
          bookmark={actor.bookmark}
        />
      </Card>
    </div>
  );

  const rightCol = (
    <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
      <Card>
        <div style={{ fontSize: 20 }}>{t("stats")}</div>
        <ActorStats
          numScenes={actor.numScenes}
          numWatches={actor.watches.length}
          averageRating={actor.averageRating}
          score={actor.score}
        />
      </Card>
      <Card>
        <CardTitle>{t("general")}</CardTitle>
        {!!actor.aliases.length && (
          <CardSection title={t("aliases")}>
            <div style={{ opacity: 0.66 }}>
              {actor.aliases.filter((x) => !x.startsWith("regex:")).join(", ")}
            </div>
          </CardSection>
        )}
        {actor.description && (
          <CardSection title={t("description")}>
            <pre
              style={{ opacity: 0.66, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {actor.description}
            </pre>
          </CardSection>
        )}
        <CardSection title={t("labels", { numItems: 2 })}>
          <LabelGroup limit={999} labels={actor.labels} />
        </CardSection>
      </Card>
      <div style={{ padding: 10 }}>
        <CardTitle style={{ marginBottom: 20 }}>
          {numScenes} {t("scene", { numItems: numScenes })}
        </CardTitle>
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
      {!!collabs.length && (
        <Card>
          <CardTitle>{t("collabs")}</CardTitle>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {collabs.map((x) => (
              <div style={{ textAlign: "center" }}>
                <div>
                  <img
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                    width="80"
                    height="80"
                    src={thumbnailUrl(x.avatar?._id)}
                    alt={x.name}
                  />
                </div>
                <div style={{ marginTop: 5, opacity: 0.75, fontSize: 14, fontWeight: 500 }}>
                  {x.name}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div>
      <Head>
        <title>{actor.name}</title>
        {/* {actor.avatar && <link rel="shortcut icon" href={thumbnailUrl(actor.avatar._id)} />} */}
      </Head>
      <HeroImage imageId={actor.hero?._id} />
      <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
        <ComplexGrid negativeTop={!!actor.hero} leftChildren={leftCol} rightChildren={rightCol} />
      </div>
    </div>
  );
}
