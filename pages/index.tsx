import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

import StatsCard from "../components/widgets/StatsCard";
import FavoritesCard from "../components/widgets/FavoritesCard";

export default function IndexPage() {
  return (
    <Container maxWidth="md">
      <Grid container columns={{ xs: 1, sm: 4 }} spacing={2}>
        <Grid item xs={1} sm={2}>
          <StatsCard />
        </Grid>
        <Grid item xs={1} sm={2}>
          <FavoritesCard />
        </Grid>
      </Grid>
    </Container>
  );
}
