import {
  CATEGORY_REFINEMENT,
  ON_SALE_REFINEMENT,
  OPTION_VALUES_REFINEMENT,
  PRICE_REFINEMENT,
  SORT_BY_REFINEMENT,
} from "@/components/search/refinement-config"
import {
  useRange,
  useRefinementList,
  useSortBy,
  useToggleRefinement,
} from "react-instantsearch"

export const PersistentRefinements = () => {
  useRefinementList(CATEGORY_REFINEMENT)
  useRefinementList(OPTION_VALUES_REFINEMENT)
  useToggleRefinement(ON_SALE_REFINEMENT)
  useRange(PRICE_REFINEMENT)
  useSortBy(SORT_BY_REFINEMENT)

  return null
}

export default PersistentRefinements
