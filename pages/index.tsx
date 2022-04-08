import Grid from "@mui/material/Grid";

import StatsCard from "../components/widgets/StatsCard";
import FavoritesCard from "../components/widgets/FavoritesCard";
import LibraryTimeCard from "../components/widgets/LibraryTimeCard";
import ScanCard from "../components/widgets/ScanCard";
import Head from "next/head";
import { useTranslations } from "next-intl";

export default function IndexPage() {
  const t = useTranslations();

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
      <Head>
        <title>{t("overview")}</title>
      </Head>
      <Grid sx={{ maxWidth: 900 }} container columns={{ xs: 1, sm: 2, md: 4 }} spacing={2}>
        <Grid item xs={1} sm={2}>
          <StatsCard />
          <LibraryTimeCard />
          <ScanCard />
        </Grid>
        <Grid item xs={1} sm={2}>
          <FavoritesCard />
        </Grid>
      </Grid>
    </div>
  );
}
