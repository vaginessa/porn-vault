import "../styles/global.scss";
import "nprogress/nprogress.css";

import { AppProps } from "next/app";
import Head from "next/head";
import { NextIntlProvider } from "next-intl";
import lang from "../locale";
import React, { useEffect } from "react";
import Router from "next/router";
import nprogress from "nprogress";
import Layout from "../components/Layout";

Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

export const ThemeContext = React.createContext({
  theme: "light",
  toggleTheme: () => {},
});

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (theme === "dark") {
      document.querySelector("html")?.classList.add("dark");
    } else {
      document.querySelector("html")?.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <title>Porn Vault</title>
      </Head>
      <NextIntlProvider messages={lang[router.locale || "en"]}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeContext.Provider>
      </NextIntlProvider>
    </>
  );
}
