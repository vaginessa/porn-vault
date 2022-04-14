import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { fetchImages, useImageList } from "../composables/use_image_list";
import { thumbnailUrl } from "../util/thumbnail";
import { GetServerSideProps } from "next";
import { IImage } from "../types/image";
import { IPaginationResult } from "../types/pagination";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { Masonry } from "masonic";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = (query.page ? parseInt(String(query.page)) : 0) || 0;
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

  const { images, fetchImages, loading, numItems, numPages } = useImageList(props.initial, {});

  const [page, setPage] = useState(props.page);
  const [pageInput, setPageInput] = useState(page);

  async function onPageChange(x: number): Promise<void> {
    setPageInput(x);
    setPage(x);
    fetchImages(x);
  }

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
        render={({ data }) => <img width="100%" src={thumbnailUrl(data._id)} alt={data.name} />}
      />
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundImages", { numItems })}</title>
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
      {renderContent()}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
