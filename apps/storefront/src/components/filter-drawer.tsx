import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { XMark } from "@medusajs/icons"

// Color mapping for swatches
const colorSwatches: Record<string, string> = {
  "Charcoal": "#36454F",
  "Ivory": "#FFFFF0",
  "Sage": "#9CAF88",
  "Terracotta": "#E2725B",
  "Navy": "#000080",
  "Camel": "#C19A6B",
  "Slate": "#708090",
  "Blush": "#DE5D83",
}

export interface FilterState {
  colors: string[]
  inStock: boolean
}

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableColors: string[]
}

export const FilterDrawer = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableColors,
}: FilterDrawerProps) => {
  // Local state for pending changes
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  // Sync local state when drawer opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalFilters(filters)
    }
    onOpenChange(isOpen)
  }

  const toggleColor = (color: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
  }

  const toggleInStock = () => {
    setLocalFilters((prev) => ({
      ...prev,
      inStock: !prev.inStock,
    }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onOpenChange(false)
  }

  const activeFilterCount = filters.colors.length + (filters.inStock ? 1 : 0)

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button className="flex-1 md:flex-none md:w-[120px] h-[72px] md:h-[120px] flex items-end justify-start p-3 text-[16px] leading-none text-white bg-black hover:bg-black/80 transition-colors">
          Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        {/* Header - matching sort drawer design */}
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
            <span className="text-[16px] text-black font-medium leading-none">Close</span>
            <XMark className="w-4 h-4 text-neutral-600" />
          </button>
        </DrawerHeader>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Colors Section */}
          {availableColors.length > 0 && (
            <div className="border-t border-[var(--color-grounded-light-gray)]">
              <div className="py-4">
                <h3 className="text-[16px] leading-[100%] font-medium text-black mb-4 px-4">
                  Colors
                </h3>
                <div>
                  {availableColors.map((color) => {
                    const isSelected = localFilters.colors.includes(color)
                    const swatchColor = colorSwatches[color] || "#888888"
                    
                    return (
                      <label
                        key={color}
                        className="w-full flex items-center py-3 px-4 hover:bg-black/5 transition-colors cursor-pointer"
                      >
                        {/* Checkbox matching cart drawer style */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleColor(color)}
                          className="appearance-none border border-neutral-400 bg-transparent checked:border-neutral-400 cursor-pointer relative checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-[7px] checked:after:h-[7px] checked:after:bg-black checked:after:content-[''] mr-3 flex-shrink-0"
                          style={{ borderRadius: 0, width: '15px', height: '15px', minWidth: '15px', minHeight: '15px' }}
                        />
                        <span
                          className="text-[16px] leading-[100%] flex-1 text-left text-black"
                        >
                          {color}
                        </span>
                        {/* Color swatch - positioned on the right */}
                        <span
                          className="w-[15px] h-[15px] rounded-full ml-auto flex-shrink-0"
                          style={{ backgroundColor: swatchColor, border: '0.5px solid rgba(0, 0, 0, 0.08)' }}
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* In Stock Toggle */}
          <div className="border-t border-[var(--color-grounded-light-gray)] py-4">
            <h3 className="text-[16px] leading-[100%] font-medium text-black mb-4 px-4">Availability</h3>
            <label
              className="w-full flex items-center px-4 py-3 hover:bg-black/5 transition-colors cursor-pointer"
            >
              {/* Checkbox matching cart drawer style */}
              <input
                type="checkbox"
                checked={localFilters.inStock}
                onChange={toggleInStock}
                className="appearance-none border border-neutral-400 bg-transparent checked:border-neutral-400 cursor-pointer relative checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-[7px] checked:after:h-[7px] checked:after:bg-black checked:after:content-[''] mr-3 flex-shrink-0"
                style={{ borderRadius: 0, width: '15px', height: '15px', minWidth: '15px', minHeight: '15px' }}
              />
              <span
                className="text-[16px] leading-[100%] text-black"
              >
                In stock
              </span>
            </label>
          </div>
        </div>

        {/* Apply & Clear Buttons - Fixed at bottom */}
        <div className="p-4 border-t border-[var(--color-grounded-light-gray)] space-y-2">
          <button
            onClick={handleApply}
            className="w-full h-[48px] bg-[var(--color-grounded-text)] text-white text-[16px] font-medium flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setLocalFilters({ colors: [], inStock: false })
              onFiltersChange({ colors: [], inStock: false })
              onOpenChange(false)
            }}
            className="w-full h-[48px] bg-black/5 text-black text-[16px] font-medium flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            Clear
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default FilterDrawer
