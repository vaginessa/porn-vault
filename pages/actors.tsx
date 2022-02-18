import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { useActorList } from "../composables/use_actor_list";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import ActorCard from "../components/ActorGridItem";
import Head from "next/head";

export default function ActorListPage() {
  const t = useTranslations();
  const [page, setPage] = useState(0);
  const { actors, loading, numPages, numItems, fetchActors } = useActorList();

  useEffect(() => {
    fetchActors(page);
  }, [page]);

  const content = loading ? (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <CircularProgress />
    </Box>
  ) : (
    <>
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
          <ActorCard
            key={actor._id}
            favorite={actor.favorite}
            name={actor.name}
            thumbnail={actor.thumbnail?._id}
          ></ActorCard>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination count={numPages} page={page + 1} onChange={(_, x) => setPage(x - 1)} />
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{t("foundActors", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex" }}>
        <Typography variant="h6">{t("foundActors", { numItems })}</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination count={numPages} page={page + 1} onChange={(_, x) => setPage(x - 1)} />
      </div>
      {content}
    </>
  );
}
