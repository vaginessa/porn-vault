import axios from "axios";
import { GetServerSideProps } from "next";

import Card from "../../components/Card";
import LabelGroup from "../../components/LabelGroup";
import { actorCardFragment } from "../../fragments/actor";
import { thumbnailUrl } from "../../util/thumbnail";
import { useEffect, useMemo, useState } from "react";
import { useSceneList } from "../../composables/use_scene_list";
import ListContainer from "../../components/ListContainer";
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
import { buildQueryParser } from "../../util/query_parser";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import useUpdateEffect from "../../composables/use_update_effect";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import Rating from "../../components/Rating";
import ListWrapper from "../../components/ListWrapper";
import Star from "mdi-react/StarIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import StarOutline from "mdi-react/StarBorderIcon";
import ActorIcon_ from "mdi-react/AccountIcon";
import ActorOutlineIcon from "mdi-react/AccountOutlineIcon";

import DropdownMenu, { DropdownItemGroup } from "@atlaskit/dropdown-menu";
import Paper from "../../components/Paper";
import { useCollabs } from "../../composables/use_collabs";
import CollabSelector from "../../components/CollabSelector";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
  },
  sortBy: {
    default: "addedOn",
  },
  sortDir: {
    default: "desc",
  },
  favorite: {
    default: false,
  },
  bookmark: {
    default: false,
  },
  rating: {
    default: 0,
  },
  actors: {
    default: [] as string[],
  },
});

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
          resolvedCustomFields {
            field {
              _id
              name
              type
              unit
            }
            value
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
  const router = useRouter();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [rating, setRating] = useState(parsedQuery.rating);

  const [actors, setActors] = useState(parsedQuery.actors);
  const [actorQuery, setActorQuery] = useState("");

  const [scenePage, setScenePage] = useState(parsedQuery.page);
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
    { actors: [actor._id, ...actors], query, favorite, bookmark, rating }
  );

  const { collabs, loading: collabsLoader } = useCollabs(actor._id);

  async function refreshScenes(): Promise<void> {
    fetchScenes(scenePage);
    queryParser.store(router, {
      q: query,
      page: scenePage,
      favorite,
      bookmark,
      rating,
      actors,
    });
  }

  async function onScenePageChange(x: number): Promise<void> {
    setScenePage(x);
    fetchScenes(x);
  }

  useUpdateEffect(() => {
    setScenePage(0);
  }, [query, favorite, bookmark, rating, JSON.stringify(actors)]);

  useEffect(() => {
    refreshScenes();
  }, [scenePage]);

  const RatingIcon = rating ? (rating === 10 ? Star : StarHalf) : StarOutline;
  const ActorIcon = actors.length ? ActorIcon_ : ActorOutlineIcon;

  const hasNoCollabs = !collabsLoader && collabs.length;

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
        <CardSection title={t("customData")}>
          {
            <ListContainer gap={15} size={200}>
              {actor.resolvedCustomFields.map(({ field, value }) => (
                <div key={field._id} style={{ overflow: "hidden" }}>
                  <div style={{ opacity: 0.8, marginBottom: 5 }}>{field.name}</div>
                  <div style={{ opacity: 0.6, fontSize: 15 }}>
                    {field.type === "MULTI_SELECT" && (
                      <div>
                        {value.join(", ")} {field.unit}
                      </div>
                    )}
                    {field.type === "SINGLE_SELECT" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                    {field.type === "BOOLEAN" && <div>{value ? "Yes" : "No"}</div>}
                    {field.type === "STRING" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                    {field.type === "NUMBER" && (
                      <div>
                        {value} {field.unit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ListContainer>
          }
        </CardSection>
      </Card>

      <div style={{ padding: 10 }}>
        <CardTitle style={{ marginBottom: 20 }}>
          {sceneLoader ? (
            "Loading..."
          ) : (
            <span>
              {numScenes} {t("scene", { numItems: numScenes })}
            </span>
          )}
        </CardTitle>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            style={{ maxWidth: 120 }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                refreshScenes();
              }
            }}
            placeholder={t("findContent")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
          <DropdownMenu
            trigger={({ triggerRef, onClick }) => (
              <div className="hover" onClick={onClick} ref={triggerRef as any}>
                <RatingIcon size={24} />
              </div>
            )}
          >
            <DropdownItemGroup>
              <div style={{ padding: "4px 10px" }}>
                <Rating value={rating} onChange={setRating} />
              </div>
            </DropdownItemGroup>
          </DropdownMenu>
          <div className="hover" style={{ display: "flex", alignItems: "center" }}>
            {favorite ? (
              <HeartIcon
                size={24}
                onClick={() => setFavorite(false)}
                style={{ color: "#ff3355" }}
              />
            ) : (
              <HeartBorderIcon size={24} onClick={() => setFavorite(true)} />
            )}
          </div>
          <div className="hover" style={{ display: "flex", alignItems: "center" }}>
            {bookmark ? (
              <BookmarkIcon size={24} onClick={() => setBookmark(false)} />
            ) : (
              <BookmarkBorderIcon size={24} onClick={() => setBookmark(true)} />
            )}
          </div>
          <DropdownMenu
            css={{ background: "#ffff00" }}
            isLoading={collabsLoader}
            appearance="tall"
            trigger={({ triggerRef, onClick }) => (
              <div
                className="hover"
                style={{ display: "flex", alignItems: "center" }}
                onClick={(ev) => {
                  if (hasNoCollabs) {
                    onClick?.(ev);
                  }
                }}
                ref={triggerRef as any}
              >
                <ActorIcon
                  style={{
                    cursor: hasNoCollabs ? "pointer" : "not-allowed",
                    opacity: hasNoCollabs ? 1 : 0.5,
                  }}
                  size={24}
                />
              </div>
            )}
          >
            <DropdownItemGroup css={{ background: "#ffff00" }}>
              <div style={{ padding: "4px 10px" }}>
                <input
                  style={{ width: "100%", marginBottom: 10 }}
                  placeholder={t("findActors")}
                  value={actorQuery}
                  onChange={(ev) => setActorQuery(ev.target.value)}
                />
                <CollabSelector
                  selected={actors}
                  items={collabs.filter((x) =>
                    x.name.toLowerCase().includes(actorQuery.toLowerCase())
                  )}
                  onChange={setActors}
                />
              </div>
            </DropdownItemGroup>
          </DropdownMenu>
          <div style={{ flexGrow: 1 }}></div>
          <Button loading={sceneLoader} onClick={refreshScenes}>
            {t("refresh")}
          </Button>
        </div>
        <ListWrapper loading={sceneLoader} noResults={!numScenes}>
          {scenes.map((scene) => (
            <SceneCard key={scene._id} scene={scene} />
          ))}
        </ListWrapper>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <Pagination numPages={numScenePages} current={scenePage} onChange={onScenePageChange} />
        </div>
      </div>
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
