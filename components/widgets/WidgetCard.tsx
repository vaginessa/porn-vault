import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

export default function WidgetCard({ children, icon, title }: Props) {
  return (
    <Card sx={{ marginBottom: 2, borderRadius: 2 }} variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" spacing={1} sx={{ marginBottom: 2 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
