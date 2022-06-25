import { useMemo, useState } from "react";
import { fetchActors, useActorList } from "../composables/use_actor_list";
import { useTranslations } from "next-intl";
import ActorCard from "../components/ActorCard";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";
import { useRouter } from "next/router";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ListContainer from "../components/ListContainer";
import Pagination from "../components/Pagination";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import useUpdateEffect from "../composables/use_update_effect";
import { buildQueryParser } from "../util/query_parser";
import { CountrySelector } from "../components/CountrySelector";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
  },
  nationality: {
    default: "",
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
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, nationality, sortBy, sortDir, favorite, bookmark } = queryParser.parse(query);

  const result = await fetchActors(page, {
    query: q,
    nationality,
    sortBy,
    sortDir,
    favorite,
    bookmark,
  });

  return {
    props: {
      page,
      initial: result,
    },
  };
};

export default function ActorListPage(props: { page: number; initial: IPaginationResult<IActor> }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [nationality, setNationality] = useState(parsedQuery.nationality);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);
  const [page, setPage] = useState(props.page);

  const { actors, loading, numPages, numItems, fetchActors } = useActorList(props.initial, {
    query,
    favorite,
    bookmark,
    sortBy,
    sortDir,
    nationality,
  });

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
    fetchActors(x);
  }

  async function refresh(): Promise<void> {
    fetchActors(page);
    queryParser.store(router, {
      q: query,
      nationality,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
    });
  }

  useUpdateEffect(() => {
    setPage(0);
  }, [query, favorite, bookmark, nationality, sortBy, sortDir]);

  useUpdateEffect(refresh, [page]);

  function renderContent() {
    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Loader />
        </div>
      );
    }

    if (!actors.length) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {t("foundActors", { numItems })}
        </div>
      );
    }

    return (
      <ListContainer>
        {actors.map((actor) => (
          <ActorCard key={actor._id} actor={actor}></ActorCard>
        ))}
      </ListContainer>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundActors", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundActors", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={(page) => onPageChange(page)} />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Button style={{ marginRight: 10 }}>+ Add actor</Button>
        {/*  <Button style={{ marginRight: 10 }}>+ Bulk add</Button> */}
        {/* <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button> */}
      </div>
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
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              refresh();
            }
          }}
          placeholder={t("findContent")}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        />
        <div className="hover">
          {favorite ? (
            <HeartIcon
              onClick={() => setFavorite(false)}
              style={{ fontSize: 32, color: "#ff3355" }}
            />
          ) : (
            <HeartBorderIcon onClick={() => setFavorite(true)} style={{ fontSize: 32 }} />
          )}
        </div>
        <div className="hover">
          {bookmark ? (
            <BookmarkIcon onClick={() => setBookmark(false)} style={{ fontSize: 32 }} />
          ) : (
            <BookmarkBorderIcon onClick={() => setBookmark(true)} style={{ fontSize: 32 }} />
          )}
        </div>
        <CountrySelector style={{ maxWidth: 150 }} value={nationality} onChange={setNationality} />
        <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
          <option value="relevance">{t("relevance")}</option>
          <option value="addedOn">{t("addedToCollection")}</option>
          <option value="rawName">A-Z</option>
          <option value="bornOn">{t("birthDate")}</option>
          <option value="rating">{t("rating")}</option>
          <option value="averageRating">{t("avgRating")}</option>
          <option value="score">{t("pvScore")}</option>
          <option value="numScenes">{t("numScenes")}</option>
          <option value="numViews">{t("numViews")}</option>
          <option value="$shuffle">{t("random")}</option>
        </select>
        <select
          disabled={sortBy === "relevance"}
          value={sortDir}
          onChange={(ev) => setSortDir(ev.target.value)}
        >
          <option value="asc">{t("asc")}</option>
          <option value="desc">{t("desc")}</option>
        </select>
        <div style={{ flexGrow: 1 }}></div>
        <Button loading={loading} onClick={refresh}>
          {t("refresh")}
        </Button>
      </div>
      <div>{renderContent()}</div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
