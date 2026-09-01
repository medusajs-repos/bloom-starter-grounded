import {
  createInstantSearchAdapter,
  type MedusaSdkLike,
} from "@medusajs/instantsearch-adapter"

import { sdk } from "@/lib/utils/sdk"

export const PRODUCT_INDEX_NAME = "product"

export const { searchClient } = createInstantSearchAdapter({
  sdk: sdk as unknown as MedusaSdkLike,
  path: "/store/search",
  numericAttributes: ["min_price"],
  additionalSearchParameters: {
    search_options: {
      count: "exact",
    },
  },
})

export const SEARCH_HITS_PER_PAGE = 12

export const STORE_HITS_PER_PAGE = 12
