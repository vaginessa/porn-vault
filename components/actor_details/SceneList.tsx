import SceneCard from "../SceneCard";
import Pagination from "../Pagination";
import CardTitle from "../CardTitle";
import Button from "../Button";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import Rating from "../Rating";
import ListWrapper from "../ListWrapper";

import DropdownMenu, { DropdownItemGroup } from "@atlaskit/dropdown-menu";
import ActorSelector from "../ActorSelector";
import { useSceneList } from "../../composables/use_scene_list";
import { useEffect, useState } from "react";
import useUpdateEffect from "../../composables/use_update_effect";

import Star from "mdi-react/StarIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import StarOutline from "mdi-react/StarBorderIcon";
import ActorIcon_ from "mdi-react/AccountIcon";
import ActorOutlineIcon from "mdi-react/AccountOutlineIcon";

import LabelIcon_ from "mdi-react/LabelIcon";
import LabelOutlineIcon from "mdi-react/LabelOutlineIcon";

import { useCollabs } from "../../composables/use_collabs";
import { useTranslations } from "next-intl";
import useLabelList from "../../composables/use_label_list";
import LabelSelector from "../LabelSelector";

type QueryState = {
  q: string;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
  actors: string[];
  labels: string[];
  page: number;
};

type Props = {
  actorId: string;
  initialState: QueryState;
  writeQuery: (qs: QueryState) => void;
};

export default function ActorDetailsPageSceneList(props: Props) {
  const t = useTranslations();

  const { collabs, loading: collabsLoader } = useCollabs(props.actorId);
  const { labels: labelList, loading: labelLoader } = useLabelList();

  const [query, setQuery] = useState(props.initialState.q);
  const [favorite, setFavorite] = useState(props.initialState.favorite);
  const [bookmark, setBookmark] = useState(props.initialState.bookmark);
  const [rating, setRating] = useState(props.initialState.rating);

  const [selectedActors, setSelectedActors] = useState(props.initialState.actors);
  const [actorQuery, setActorQuery] = useState("");

  const [selectedLabels, setSelectedLabels] = useState(props.initialState.labels);
  const [labelQuery, setLabelQuery] = useState("");

  const [page, setPage] = useState(props.initialState.page);
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
    {
      actors: [props.actorId, ...selectedActors],
      include: selectedLabels,
      query,
      favorite,
      bookmark,
      rating,
    }
  );

  async function refreshScenes(): Promise<void> {
    fetchScenes(page);
    props.writeQuery({
      q: query,
      page,
      favorite,
      bookmark,
      rating,
      labels: selectedLabels,
      actors: selectedActors,
    });
  }

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
    fetchScenes(x);
  }

  useUpdateEffect(() => {
    setPage(0);
  }, [
    query,
    favorite,
    bookmark,
    rating,
    JSON.stringify(selectedActors),
    JSON.stringify(selectedLabels),
  ]);

  useEffect(() => {
    refreshScenes();
  }, [page]);

  const RatingIcon = rating ? (rating === 10 ? Star : StarHalf) : StarOutline;
  const ActorIcon = selectedActors.length ? ActorIcon_ : ActorOutlineIcon;
  const LabelIcon = selectedLabels.length ? LabelIcon_ : LabelOutlineIcon;

  const hasNoCollabs = !collabsLoader && !collabs.length;
  const hasNoLabels = !labelLoader && !labelList.length;

  return (
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
            <HeartIcon size={24} onClick={() => setFavorite(false)} style={{ color: "#ff3355" }} />
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
          isLoading={labelLoader}
          appearance="tall"
          trigger={({ triggerRef, onClick }) => (
            <div
              className="hover"
              style={{ display: "flex", alignItems: "center" }}
              onClick={(ev) => {
                if (!hasNoLabels) {
                  onClick?.(ev);
                }
              }}
              ref={triggerRef as any}
            >
              <LabelIcon
                style={{
                  cursor: hasNoLabels ? "not-allowed" : "pointer",
                  opacity: hasNoLabels ? 0.5 : 1,
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
                placeholder={t("findLabels")}
                value={labelQuery}
                onChange={(ev) => setLabelQuery(ev.target.value)}
              />
              <LabelSelector
                selected={selectedLabels}
                items={labelList.filter(
                  (label) =>
                    label.name.toLowerCase().includes(labelQuery.toLowerCase()) ||
                    label.aliases.some((alias) =>
                      alias.toLowerCase().includes(labelQuery.toLowerCase())
                    )
                )}
                onChange={setSelectedLabels}
              />
            </div>
          </DropdownItemGroup>
        </DropdownMenu>
        <DropdownMenu
          css={{ background: "#ffff00" }}
          isLoading={collabsLoader}
          appearance="tall"
          trigger={({ triggerRef, onClick }) => (
            <div
              className="hover"
              style={{ display: "flex", alignItems: "center" }}
              onClick={(ev) => {
                if (!hasNoCollabs) {
                  onClick?.(ev);
                }
              }}
              ref={triggerRef as any}
            >
              <ActorIcon
                style={{
                  cursor: hasNoCollabs ? "not-allowed" : "pointer",
                  opacity: hasNoCollabs ? 0.5 : 1,
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
              <ActorSelector
                selected={selectedActors}
                items={collabs.filter(
                  (collab) =>
                    collab.name.toLowerCase().includes(actorQuery.toLowerCase()) ||
                    collab.aliases.some((alias) =>
                      alias.toLowerCase().includes(actorQuery.toLowerCase())
                    )
                )}
                onChange={setSelectedActors}
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
        <Pagination numPages={numScenePages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
