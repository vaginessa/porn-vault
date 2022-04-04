import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ListContainer from "../components/ListContainer";
import Loader from "../components/Loader";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import { fetchMovies, useMovieList } from "../composables/use_movie_list";
import { IMovie } from "../types/movie";
import { IPaginationResult } from "../types/pagination";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = (query.page ? parseInt(String(query.page)) : 0) || 0;
  const result = await fetchMovies(page, {
    query: query.q || "",
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

export default function ActorListPage(props: { page: number; initial: IPaginationResult<IMovie> }) {
  const router = useRouter();
  const t = useTranslations();

  const [query, setQuery] = useState(router.query.q || "");
  const [favorite, setFavorite] = useState(router.query.favorite === "true");
  const [bookmark, setBookmark] = useState(router.query.bookmark === "true");
  const [sortBy, setSortBy] = useState(router.query.sortBy || "addedOn");
  const [sortDir, setSortDir] = useState(router.query.sortDir || "desc");

  const [page, setPage] = useState(props.page);
  const [pageInput, setPageInput] = useState(page);

  const { movies, loading, numPages, numItems, fetchMovies } = useMovieList(props.initial, {
    query,
    favorite,
    bookmark,
    sortBy,
    sortDir,
  });

  async function onPageChange(x: number): Promise<void> {
    setPageInput(x);
    setPage(x);
    fetchMovies(x);
  }

  async function refresh(): Promise<void> {
    fetchMovies(pageInput);
    setPage(pageInput);
    router.push(
      `/movies?q=${query}&favorite=${String(favorite)}&bookmark=${String(
        bookmark
      )}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  useEffect(() => {
    setPageInput(0);
  }, [query, favorite, bookmark, sortBy, sortDir]);

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
        PAGINATION
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
        <div onClick={refresh}>Refresh</div>
      </div>
      <div>{renderContent()}</div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
