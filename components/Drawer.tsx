import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { useTranslations } from "next-intl";
import Axios from "axios";

import DarkIcon from "@mui/icons-material/Home";
import LightIcon from "@mui/icons-material/WbSunny";

import SceneIcon from "@mui/icons-material/Videocam";
import ActorIcon from "@mui/icons-material/AccountBox";
import MovieIcon from "@mui/icons-material/VideoLibrary";
import StudioIcon from "@mui/icons-material/CameraAlt";
import ImageIcon from "@mui/icons-material/Image";
import MarkerIcon from "@mui/icons-material/SkipNext";
import { useRouter } from "next/router";
import Link from "next/link";

const drawerWidth = 200;

interface Props {
  children: React.ReactNode;
  theme: string;
  onThemeChange: () => void;
}

const links = [
  {
    text: "scene",
    icon: <SceneIcon />,
    url: "/scenes",
  },
  {
    text: "actor",
    icon: <ActorIcon />,
    url: "/actors",
  },
  {
    text: "movie",
    icon: <MovieIcon />,
    url: "/movies",
  },
  {
    text: "studio",
    icon: <StudioIcon />,
    url: "/studios",
  },
  {
    text: "image",
    icon: <ImageIcon />,
    url: "/images",
  },
  {
    text: "marker",
    icon: <MarkerIcon />,
    url: "/markers",
  },
];

export default function ResponsiveDrawer({ children, theme, onThemeChange }: Props) {
  const router = useRouter();
  const t = useTranslations();

  const [searchText, setSearchText] = useState("");

  const [version, setVersion] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  function switchLocale(locale: string): void {
    router.push("", {}, { locale });
  }

  useEffect(() => {
    Axios.get("/api/version").then((res) => {
      setVersion(res.data.result);
    });
  }, []);

  const drawer = (
    <div>
      <Toolbar>
        <img
          onClick={() => router.push("/")}
          className="hover"
          width={36}
          height={36}
          src="/assets/favicon.png"
          style={{ marginRight: 5 }}
        />
        <span style={{ fontWeight: 600, opacity: 0.75 }}>{version}</span>
        <div style={{ flexGrow: 1 }}></div>
        <IconButton onClick={onThemeChange} sx={{ ml: 1 }} color="inherit">
          {theme === "dark" ? <DarkIcon /> : <LightIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {links.map(({ text, icon, url }) => (
          <Link key={text} href={url}>
            <ListItem button key={text}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={t(text, { numItems: 0 })} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider></Divider>
      <div style={{ marginTop: 4, gap: 8, display: "flex", justifyContent: "center" }}>
        <img
          className="hover"
          onClick={() => switchLocale("en")}
          src="/assets/flags/us.svg"
          width="24"
          height="24"
        />
        <img
          className="hover"
          onClick={() => switchLocale("de")}
          src="/assets/flags/de.svg"
          width="24"
          height="24"
        />
      </div>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <div style={{ flexGrow: 1 }}></div>
          <input
            value={searchText}
            onChange={(ev) => setSearchText(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                router.push(`/search?q=${searchText}`);
              }
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "none",
              marginRight: 4,
            }}
            placeholder={t("findContent")}
          ></input>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
