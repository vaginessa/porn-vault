import { AppProps } from "next/app";
import Head from "next/head";
import { NextIntlProvider } from "next-intl";
import lang from "../locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import "../styles/global.css";

import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "../components/Drawer";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <NextIntlProvider messages={lang[router.locale || "en"]}>
          <Drawer theme={mode} onThemeChange={colorMode.toggleColorMode}>
            <Component {...pageProps} />
          </Drawer>
        </NextIntlProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
