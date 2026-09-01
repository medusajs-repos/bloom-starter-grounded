import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { SORT_BY_REFINEMENT } from "@/components/search/refinement-config"
import { XMark } from "@medusajs/icons"
import { useSortBy } from "react-instantsearch"

type SearchSortDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SearchSortDrawer = ({
  open,
  onOpenChange,
}: SearchSortDrawerProps) => {
  const { currentRefinement, options, refine } = useSortBy(SORT_BY_REFINEMENT)

  const currentLabel =
    options.find((option) => option.value === currentRefinement)?.label ??
    "Sort"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button
          className="flex-1 md:flex-none md:w-[120px] h-[72px] md:h-[120px] flex items-end justify-start p-3 text-[16px] leading-tight text-[#1a1a1a] bg-neutral-100 hover:bg-neutral-200 backdrop-blur-xl transition-colors"
          data-testid="sort-trigger"
        >
          <span className="truncate text-left">{currentLabel}</span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        <DrawerHeader className="flex items-start justify-between !p-2 !h-auto !border-0">
          <div className="text-left p-2">
            <DrawerTitle className="text-[20px] font-medium leading-none text-[var(--color-grounded-text)]">
              Sort by
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
          <div className="border-t border-[var(--color-grounded-light-gray)]">
            {options.map((option) => {
              const isSelected = currentRefinement === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    refine(option.value)
                    onOpenChange(false)
                  }}
                  className="w-full flex items-center px-4 py-5 border-b border-[var(--color-grounded-light-gray)] hover:bg-black/5 transition-colors cursor-pointer"
                  data-testid={`sort-option-${option.value}`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 bg-black mr-3 flex-shrink-0" />
                  )}
                  <span
                    className={`text-[16px] leading-none ${
                      isSelected ? "font-medium text-black" : "text-black"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SearchSortDrawer
