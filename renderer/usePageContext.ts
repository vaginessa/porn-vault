// Hook `usePageContext()` to make `pageContext` available from any Vue component.
// See https://vite-plugin-ssr.com/pageContext-anywhere

import { inject } from "vue";
import type { App } from "vue";
import { PageContext } from "./types";

const key = Symbol();

export function usePageContext() {
  const pageContext = inject(key);
  return pageContext;
}

export function setPageContext(app: App, pageContext: PageContext) {
  app.provide(key, pageContext);
}
