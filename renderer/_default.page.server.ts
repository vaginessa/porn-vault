import { renderToNodeStream } from "@vue/server-renderer";
import { escapeInject } from "vite-plugin-ssr";
import { createApp } from "./app";
import { getPageTitle } from "./getPageTitle";
import type { PageContext } from "./types";
import type { PageContextBuiltIn } from "vite-plugin-ssr";

export const passToClient = ["pageProps", "documentProps", "locale"];

export async function render(pageContext: PageContextBuiltIn & PageContext) {
  const app = createApp(pageContext);
  const stream = renderToNodeStream(app);

  const title = getPageTitle(pageContext);

  const html = escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <link rel=icon href="/assets/favicon.png">
      </head>
      <body>
        <div id="app">${stream}</div>
      </body>
    </html>`;
  return html;
}
