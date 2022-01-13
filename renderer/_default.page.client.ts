import "nprogress/nprogress.css";

import { createApp } from "./app";
import { getPageTitle } from "./getPageTitle";
import { useClientRouter } from "vite-plugin-ssr/client/router";
import type { PageContext } from "./types";
import type { PageContextBuiltInClient } from "vite-plugin-ssr/client/router";
import NProgress from "nprogress";

function onTransitionStart() {
  console.log("Page transition start");
  document.querySelector(".content")!.classList.add("page-transition");
  NProgress.start();
}

function onTransitionEnd() {
  console.log("Page transition end");
  document.querySelector(".content")!.classList.remove("page-transition");
  NProgress.done();
  NProgress.remove();
}

let app: ReturnType<typeof createApp>;
const { hydrationPromise } = useClientRouter({
  render(pageContext: PageContextBuiltInClient & PageContext) {
    if (!app) {
      app = createApp(pageContext);
      app.mount("#app");
    } else {
      app.changePage(pageContext);
    }
    document.title = getPageTitle(pageContext);
  },
  // Vue needs the first render to be a hydration
  ensureHydration: true,
  prefetchLinks: true,
  onTransitionStart,
  onTransitionEnd,
});

hydrationPromise.then(() => {
  console.log("Hydration finished; page is now interactive.");
});
