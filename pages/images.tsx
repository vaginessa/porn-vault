import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { fetchImages, useImageList } from "../composables/use_image_list";
import { imageUrl, thumbnailUrl } from "../util/thumbnail";
import { GetServerSideProps } from "next";
import { IImage } from "../types/image";
import { IPaginationResult } from "../types/pagination";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { Masonry } from "masonic";

import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import Button from "../components/Button";
import useUpdateEffect from "../composables/use_update_effect";
import ImageCard from "../components/ImageCard";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = Math.max(0, (query.page ? parseInt(String(query.page)) : 0) || 0);
  const result = await fetchImages(page, {
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

export default function ImageListPage(props: { page: number; initial: IPaginationResult<IImage> }) {
  const router = useRouter();
  const t = useTranslations();

  const [query, setQuery] = useState(router.query.q || "");
  const [favorite, setFavorite] = useState(router.query.favorite === "true");
  const [bookmark, setBookmark] = useState(router.query.bookmark === "true");
  const [sortBy, setSortBy] = useState(router.query.sortBy || "addedOn");
  const [sortDir, setSortDir] = useState(router.query.sortDir || "desc");

  const { images, fetchImages, loading, numItems, numPages } = useImageList(props.initial, {
    query,
    favorite,
    bookmark,
    sortBy,
    sortDir,
  });

  const [page, setPage] = useState(props.page);

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
  }

  async function refresh(): Promise<void> {
    fetchImages(page);
    router.push(
      `/images?q=${query}&favorite=${String(favorite)}&bookmark=${String(
        bookmark
      )}&sortBy=${sortBy}&sortDir=${sortDir}&page=${page}`
    );
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

    if (!images.length) {
      return (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {t("foundImages", { numItems })}
        </div>
      );
    }

    return (
      <Masonry
        items={images}
        rowGutter={1}
        columnGutter={4}
        render={({ data }) => (
          <ImageCard
            key={data._id}
            fullSrc={imageUrl(data._id)}
            src={thumbnailUrl(data._id)}
            alt={data.name}
          />
        )}
      />
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundImages", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundImages", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={(page) => onPageChange(page)} />
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
          <option value="rating">{t("rating")}</option>
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
        <Button onClick={refresh}>{t("refresh")}</Button>
      </div>
      {renderContent()}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
