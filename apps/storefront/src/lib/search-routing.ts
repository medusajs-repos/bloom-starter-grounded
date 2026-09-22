import historyRouter from "instantsearch.js/es/lib/routers/history"
import type { UiState } from "instantsearch.js"

import { PRODUCT_INDEX_NAME } from "@/lib/search-client"

const SSR_LOCATION = {
  href: "",
  protocol: "",
  hostname: "",
  port: "",
  pathname: "",
  search: "",
  hash: "",
} as unknown as Location

const router = historyRouter<UiState>({
  getLocation: () =>
    typeof window === "undefined" ? SSR_LOCATION : window.location,
})

const stateMapping = {
  stateToRoute(uiState: UiState) {
    return (uiState[PRODUCT_INDEX_NAME] ?? {}) as UiState
  },
  routeToState(routeState: UiState = {} as UiState) {
    return { [PRODUCT_INDEX_NAME]: routeState } as UiState
  },
}

export const productSearchRouting = { router, stateMapping }
