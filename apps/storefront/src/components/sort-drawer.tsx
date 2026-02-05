import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { XMark } from "@medusajs/icons"

export type SortOption = 
  | "featured" 
  | "best_selling" 
  | "alpha_asc" 
  | "alpha_desc" 
  | "price_asc" 
  | "price_desc" 
  | "date_asc" 
  | "date_desc"

interface SortDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best_selling", label: "Best selling" },
  { value: "alpha_asc", label: "Alphabetically, A-Z" },
  { value: "alpha_desc", label: "Alphabetically, Z-A" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "date_asc", label: "Date, old to new" },
  { value: "date_desc", label: "Date, new to old" },
]

export const SortDrawer = ({
  open,
  onOpenChange,
  currentSort,
  onSortChange,
}: SortDrawerProps) => {
  const handleSelect = (value: SortOption) => {
    onSortChange(value)
    onOpenChange(false)
  }

  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || "Sort"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button className="flex-1 md:flex-none md:w-[120px] h-[72px] md:h-[120px] flex items-end justify-start p-3 text-[16px] leading-tight text-[#1a1a1a] bg-neutral-100 hover:bg-neutral-200 backdrop-blur-xl transition-colors">
          <span className="truncate text-left">{currentLabel}</span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        {/* Header - matching cart design */}
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
            <span className="text-[16px] text-black font-medium leading-none">Close</span>
            <XMark className="w-4 h-4 text-neutral-600" />
          </button>
        </DrawerHeader>

        {/* Sort Options */}
        <div className="flex-1 overflow-y-auto">
          <div className="border-t border-[var(--color-grounded-light-gray)]">
            {sortOptions.map((option) => {
              const isSelected = currentSort === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="w-full flex items-center px-4 py-5 border-b border-[var(--color-grounded-light-gray)] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  {isSelected && (
                    <span className="w-2 h-2 bg-black mr-3 flex-shrink-0" />
                  )}
                  <span
                    className={`text-[16px] leading-none ${
                      isSelected
                        ? "font-medium text-black"
                        : "text-black"
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

export default SortDrawer
