import {
  CATEGORY_REFINEMENT,
  OPTION_VALUES_REFINEMENT,
  onSaleRefinement,
  priceRefinement,
  sortByRefinement,
} from "@/components/search/refinement-config"
import {
  useRange,
  useRefinementList,
  useSortBy,
  useToggleRefinement,
} from "react-instantsearch"

export const PersistentRefinements = ({
  currencyCode,
}: {
  currencyCode: string
}) => {
  useRefinementList(CATEGORY_REFINEMENT)
  useRefinementList(OPTION_VALUES_REFINEMENT)
  useToggleRefinement(onSaleRefinement(currencyCode))
  useRange(priceRefinement(currencyCode))
  useSortBy(sortByRefinement(currencyCode))

  return null
}

export default PersistentRefinements
