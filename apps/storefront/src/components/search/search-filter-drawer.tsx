import { OnSaleToggle } from "@/components/search/on-sale-toggle"
import { OptionValuesRefinement } from "@/components/search/option-values-refinement"
import { PriceRangeRefinement } from "@/components/search/price-range-refinement"
import { RefinementCheckboxList } from "@/components/search/refinement-checkbox-list"
import { CATEGORY_REFINEMENT } from "@/components/search/refinement-config"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { XMark } from "@medusajs/icons"
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch"

type SearchFilterDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SearchFilterDrawer = ({
  open,
  onOpenChange,
}: SearchFilterDrawerProps) => {
  const { items } = useCurrentRefinements()
  const { canRefine: canClear, refine: clearAll } = useClearRefinements()

  const appliedCount = items.reduce(
    (total, item) => total + item.refinements.length,
    0
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button
          className="flex-1 md:flex-none md:w-[120px] h-[72px] md:h-[120px] flex items-end justify-start p-3 text-[16px] leading-tight text-[#1a1a1a] bg-neutral-100 hover:bg-neutral-200 backdrop-blur-xl transition-colors"
          data-testid="filter-trigger"
        >
          <span className="truncate text-left">
            Filter{appliedCount > 0 ? ` (${appliedCount})` : ""}
          </span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        <DrawerHeader className="flex items-start justify-between !p-2 !h-auto !border-0">
          <div className="text-left p-2">
            <DrawerTitle className="text-[20px] font-medium leading-none text-[var(--color-grounded-text)]">
              Filter
            </DrawerTitle>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-[80px] h-[80px] flex flex-col justify-between items-start p-2 bg-black/5 hover:bg-black/10 rounded-none transition-colors self-start cursor-pointer"
          >
            <span className="text-[16px] text-black font-medium leading-none">
              Close
            </span>
            <XMark className="w-4 h-4 text-neutral-600" />
          </button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <OnSaleToggle />
          <RefinementCheckboxList
            options={CATEGORY_REFINEMENT}
            title="Category"
          />
          <OptionValuesRefinement />
          <PriceRangeRefinement />
        </div>

        {canClear && (
          <div className="border-t border-[var(--color-grounded-light-gray)] p-4">
            <button
              onClick={() => clearAll()}
              className="w-full border border-black px-4 py-3 text-[16px] leading-none text-black hover:bg-black hover:text-white transition-colors"
              data-testid="clear-refinements-drawer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default SearchFilterDrawer
