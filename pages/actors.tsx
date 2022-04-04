import { useEffect, useState } from "react";
import { fetchActors, useActorList } from "../composables/use_actor_list";
import { useTranslations } from "next-intl";
import ActorCard from "../components/ActorCard";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IPaginationResult } from "../types/pagination";
import { IActor } from "../types/actor";
import countries from "../src/data/countries";
import { useRouter } from "next/router";
import Loader from "../components/Loader";
import Button from "../components/Button";
import ListContainer from "../components/ListContainer";
import Card from "../components/Card";
import Pagination from "../components/Pagination";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = (query.page ? parseInt(String(query.page)) : 0) || 0;
  const result = await fetchActors(page, {
    query: query.q || "",
    nationality: query.nationality || "",
    sortBy: query.sortBy || "addedOn",
    sortDir: query.sortDir || "desc",
    favorite: query.favorite === "true",
    bookmark: query.bookmark === "true",
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

  const [query, setQuery] = useState(router.query.q || "");
  const [favorite, setFavorite] = useState(router.query.favorite === "true");
  const [bookmark, setBookmark] = useState(router.query.bookmark === "true");
  const [nationality, setNationality] = useState(router.query.nationality || "");
  const [sortBy, setSortBy] = useState(router.query.sortBy || "addedOn");
  const [sortDir, setSortDir] = useState(router.query.sortDir || "desc");

  const [page, setPage] = useState(props.page);
  const [pageInput, setPageInput] = useState(page);

  const { actors, loading, numPages, numItems, fetchActors } = useActorList(props.initial, {
    query,
    favorite,
    bookmark,
    sortBy,
    sortDir,
    nationality,
  });

  async function onPageChange(x: number): Promise<void> {
    setPageInput(x);
    setPage(x);
    fetchActors(x);
  }

  async function refresh(): Promise<void> {
    fetchActors(pageInput);
    setPage(pageInput);
    router.push(
      `/actors?q=${query}&nationality=${nationality}&favorite=${String(favorite)}&bookmark=${String(
        bookmark
      )}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  useEffect(() => {
    setPageInput(0);
  }, [query, favorite, bookmark, nationality, sortBy, sortDir]);

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
        <Pagination
          numPages={numPages}
          current={page}
          onChange={(page) => onPageChange(page - 1)}
        />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Button style={{ marginRight: 10 }}>+ Add actor</Button>
        <Button style={{ marginRight: 10 }}>+ Bulk add</Button>
        <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button>
      </div>
      <Card style={{ marginBottom: 20, padding: 10 }}>
        <div>Filters</div>
        <div>
          <input
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                refresh();
              }
            }}
            placeholder="Search"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
        </div>
        <div>
          <input
            type="checkbox"
            checked={favorite}
            onChange={(ev) => setFavorite(ev.target.checked)}
          />
          {t("favorite")}
        </div>
        <div>
          <input
            type="checkbox"
            checked={bookmark}
            onChange={(ev) => setBookmark(ev.target.checked)}
          />
          {t("bookmarked")}
        </div>
        <div>
          <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
            <option value="addedOn">Added to collection</option>
            <option value="bornOn">Birth date</option>
            <option value="rating">Rating</option>
            <option value="score">Score</option>
          </select>
        </div>
        <div>
          <select value={sortDir} onChange={(ev) => setSortDir(ev.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div>
          <select
            style={{ maxWidth: 200 }}
            value={nationality}
            onChange={(ev) => setNationality(ev.target.value)}
          >
            <option value={""}>-</option>
            {countries
              .filter(({ relevancy }) => relevancy > 1)
              .map((c) => (
                <option key={c.alpha2} value={c.alpha2}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}></div>
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </Card>
      <div>{renderContent()}</div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
