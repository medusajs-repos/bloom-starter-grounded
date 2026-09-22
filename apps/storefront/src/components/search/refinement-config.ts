import { PRODUCT_INDEX_NAME, priceAttribute } from "@/lib/search-client"
import type {
  UseRangeProps,
  UseRefinementListProps,
  UseSortByProps,
  UseToggleRefinementProps,
} from "react-instantsearch"

export const CATEGORY_REFINEMENT: UseRefinementListProps = {
  attribute: "category",
  operator: "or",
  limit: 50,
  sortBy: ["count:desc", "name:asc"],
}

export const OPTION_VALUES_REFINEMENT: UseRefinementListProps = {
  attribute: "option_values",
  operator: "or",
  limit: 200,
  sortBy: ["name:asc"],
}

export const onSaleRefinement = (
  currencyCode: string
): UseToggleRefinementProps => ({
  attribute: priceAttribute("on_sale", currencyCode),
  on: true,
})

export const priceRefinement = (currencyCode: string): UseRangeProps => ({
  attribute: priceAttribute("min_price", currencyCode),
})

const sortValue = (field: string, direction: "asc" | "desc") =>
  `${PRODUCT_INDEX_NAME}/sort/${field}:${direction}`

export const sortByRefinement = (currencyCode: string): UseSortByProps => {
  const minPrice = priceAttribute("min_price", currencyCode)

  return {
    items: [
      { label: "Relevance", value: PRODUCT_INDEX_NAME },
      { label: "Price, low to high", value: sortValue(minPrice, "asc") },
      { label: "Price, high to low", value: sortValue(minPrice, "desc") },
      { label: "Newest first", value: sortValue("created_at", "desc") },
      { label: "Alphabetically, A-Z", value: sortValue("title", "asc") },
      { label: "Alphabetically, Z-A", value: sortValue("title", "desc") },
    ],
  }
}
