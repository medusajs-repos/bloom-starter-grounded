import { PRODUCT_INDEX_NAME } from "@/lib/search-client"
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

export const ON_SALE_REFINEMENT: UseToggleRefinementProps = {
  attribute: "on_sale",
  on: true,
}

export const PRICE_REFINEMENT: UseRangeProps = {
  attribute: "min_price",
}

const sortValue = (field: string, direction: "asc" | "desc") =>
  `${PRODUCT_INDEX_NAME}/sort/${field}:${direction}`

export const SORT_BY_REFINEMENT: UseSortByProps = {
  items: [
    { label: "Relevance", value: PRODUCT_INDEX_NAME },
    { label: "Price, low to high", value: sortValue("min_price", "asc") },
    { label: "Price, high to low", value: sortValue("min_price", "desc") },
    { label: "Newest first", value: sortValue("created_at", "desc") },
    { label: "Alphabetically, A-Z", value: sortValue("title", "asc") },
    { label: "Alphabetically, Z-A", value: sortValue("title", "desc") },
  ],
}
