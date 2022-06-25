import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import ListContainer from "../components/ListContainer";
import Loader from "../components/Loader";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import { fetchMovies, useMovieList } from "../composables/use_movie_list";
import { IMovie } from "../types/movie";
import { IPaginationResult } from "../types/pagination";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import Button from "../components/Button";
import useUpdateEffect from "../composables/use_update_effect";
import { buildQueryParser } from "../util/query_parser";

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
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, sortBy, sortDir, favorite, bookmark } = queryParser.parse(query);

  const result = await fetchMovies(page, {
    query: q,
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

export default function ActorListPage(props: { page: number; initial: IPaginationResult<IMovie> }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);
  const [page, setPage] = useState(props.page);

  const { movies, loading, numPages, numItems, fetchMovies } = useMovieList(props.initial, {
    query,
    favorite,
    bookmark,
    sortBy,
    sortDir,
  });

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
  }

  async function refresh(): Promise<void> {
    fetchMovies(page);
    queryParser.store(router, {
      q: query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
    });
  }

  useUpdateEffect(() => {
    setPage(0);
  }, [query, favorite, bookmark, sortBy, sortDir]);

  useUpdateEffect(refresh, [page]);

  function renderContent() {
    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Loader />
        </div>
      );
    }

    if (!movies.length) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {t("foundMovies", { numItems })}
        </div>
      );
    }

    return (
      <ListContainer>
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie}></MovieCard>
        ))}
      </ListContainer>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundMovies", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundMovies", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
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
        <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
          <option value="relevance">{t("relevance")}</option>
          <option value="addedOn">{t("addedToCollection")}</option>
          <option value="duration">{t("duration")}</option>
          <option value="numScenes">{t("numScenes")}</option>
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
