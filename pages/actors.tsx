import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { fetchActors, useActorList } from "../composables/use_actor_list";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Loader />
        </Box>
      );
    }

    if (!actors.length) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {t("foundActors", { numItems })}
        </Box>
      );
    }

    return (
      <div
        className="list-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gridGap: 4,
        }}
      >
        {actors.map((actor) => (
          /* TODO: use proper cards */
          <ActorCard key={actor._id} actor={actor}></ActorCard>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundActors", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex" }}>
        <Typography variant="h6">{t("foundActors", { numItems })}</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination count={numPages} page={page + 1} onChange={(_, x) => onPageChange(x - 1)} />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Button style={{ marginRight: 10 }}>+ Add actor</Button>
        <Button style={{ marginRight: 10 }}>+ Bulk add</Button>
        <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button>
      </div>
      <div style={{ border: "1px solid grey", padding: 8, marginBottom: 20 }}>
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
          Favorite
        </div>
        <div>
          <input
            type="checkbox"
            checked={bookmark}
            onChange={(ev) => setBookmark(ev.target.checked)}
          />
          Bookmarked
        </div>
        <div>
          <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
            <option value="addedOn">Added to collection</option>
            <option selected value="bornOn">
              Birth date
            </option>
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
          <select value={nationality} onChange={(ev) => setNationality(ev.target.value)}>
            <option value={""}>-</option>
            {countries.map((c) => (
              <option value={c.alpha2}>{c.name}</option>
            ))}
          </select>
        </div>
        <div onClick={refresh}>Refresh</div>
      </div>
      <div>{renderContent()}</div>
      <div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <Pagination count={numPages} page={page + 1} onChange={(_, x) => onPageChange(x - 1)} />
        </div>
      </div>
    </div>
  );
}
