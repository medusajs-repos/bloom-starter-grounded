import ProductRowCard from "@/components/product-row-card"
import { SortDrawer, SortOption } from "@/components/sort-drawer"
import { FilterDrawer, FilterState } from "@/components/filter-drawer"
import { useProducts, useProductCount } from "@/lib/hooks/use-products"
import { useLoaderData } from "@tanstack/react-router"
import { useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

type ViewMode = "list" | "grid"

// Available colors in the store
const AVAILABLE_COLORS = [
  "Charcoal",
  "Ivory",
  "Sage",
  "Terracotta",
  "Navy",
  "Camel",
  "Slate",
  "Blush",
]

const Store = () => {
  const { region } = useLoaderData({ from: "/$countryCode/store" })
  const [viewMode] = useState<ViewMode>("list")
  const [controlsVisible, setControlsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [currentSort, setCurrentSort] = useState<SortOption>("featured")
  const [filters, setFilters] = useState<FilterState>({ colors: [], inStock: false })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Always show when near top
      if (currentScrollY < 50) {
        setControlsVisible(true)
      } 
      // Show when scrolling up
      else if (currentScrollY < lastScrollY) {
        setControlsVisible(true)
      } 
      // Hide when scrolling down
      else if (currentScrollY > lastScrollY) {
        setControlsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useProducts({
    region_id: region.id,
    query_params: { limit: 50 },
  })

  const { data: productCount } = useProductCount({ region_id: region.id })

  // Filter and sort products
  const products = useMemo(() => {
    const rawProducts = data?.pages.flatMap((page) => page.products) || []
    let filtered = [...rawProducts]
    
    // Apply color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter((product) => {
        // Check if any variant has a matching color option
        return product.variants?.some((variant) => {
          return variant.options?.some((opt) => {
            const optionWithTitle = opt as typeof opt & { option?: { title?: string } }
            return optionWithTitle.option?.title === "Color" && filters.colors.includes(opt.value ?? "")
          })
        })
      })
    }

    // Apply in-stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => {
        return product.variants?.some((variant) => {
          // Check if variant is in stock (inventory quantity > 0 or not managed)
          return (variant.inventory_quantity ?? 0) > 0 || !variant.manage_inventory
        })
      })
    }
    
    // Sort
    const sorted = filtered
    switch (currentSort) {
      case "alpha_asc":
        return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      case "alpha_desc":
        return sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""))
      case "price_asc":
        return sorted.sort((a, b) => {
          const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          return priceA - priceB
        })
      case "price_desc":
        return sorted.sort((a, b) => {
          const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          return priceB - priceA
        })
      case "date_asc":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateA - dateB
        })
      case "date_desc":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
      case "best_selling":
        // Best selling would require sales data, for now keep original order
        return sorted
      case "featured":
      default:
        // Featured keeps original/API order
        return sorted
    }
  }, [data?.pages, currentSort, filters])

  return (
    <div className="bg-white min-h-screen overflow-x-hidden leading-none">
      {/* Fixed Controls */}
      <div 
        className={`fixed bottom-2 left-2 right-2 md:left-auto md:bottom-auto md:top-[56px] z-50 flex items-center gap-2 transition-transform duration-300 ${
          controlsVisible ? "translate-y-0 md:translate-x-0" : "translate-y-[calc(100%+8px)] md:translate-y-0 md:translate-x-[calc(100%+8px)]"
        }`}
      >
        <SortDrawer
          open={sortDrawerOpen}
          onOpenChange={setSortDrawerOpen}
          currentSort={currentSort}
          onSortChange={setCurrentSort}
        />
        <FilterDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          filters={filters}
          onFiltersChange={setFilters}
          availableColors={AVAILABLE_COLORS}
        />
      </div>

      {/* Header */}
      <div className="w-full pt-12">
        <div className="pt-4 px-4 pb-16 md:pt-8 md:px-8 md:pb-28">
          <div className="flex items-start">
            <h1 className="text-[40px] md:text-[56px] font-normal text-[#1a1a1a] leading-[0.8] tracking-[-0.02em]">
              All Products
            </h1>
            <span className="text-lg text-black leading-none">
              {productCount ?? ""}
            </span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="w-full pb-[160px]">
        {isFetching && products.length === 0 ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <ProductRowSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border-t border-[#e5e5e5]">
            <p className="text-[#999] text-[13px]">
              No products found
            </p>
          </div>
        ) : viewMode === "list" ? (
          <>
            <div className="border-t border-[#e5e5e5]">
              {products.map((product, index) => (
                <ProductRowCard 
                  key={product.id} 
                  product={product} 
                  isLast={index === products.length - 1}
                />
              ))}
            </div>

            {/* Load more */}
            {hasNextPage && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-[13px] text-[#1a1a1a] border border-[#1a1a1a] px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        ) : (
          <GridView 
            products={products} 
            hasNextPage={hasNextPage} 
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </div>
  )
}

// Grid view fallback
const GridView = ({
  products,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: {
  products: HttpTypes.StoreProduct[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}) => {
  const { countryCode } = useLoaderData({ from: "/$countryCode/store" })
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 pt-8">
        {products.map((product) => {
          // Get thumbnail from first variant's images
          const firstVariant = product.variants?.[0] as HttpTypes.StoreProductVariant & { images?: { url: string }[] }
          const variantImages = firstVariant?.images
          const thumbnail = variantImages?.[0]?.url || product.thumbnail
          
          return (
            <a
              key={product.id}
              href={`/${countryCode}/products/${product.handle}`}
              className="group flex flex-col"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#f5f5f5] relative mb-3">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={product.title}
                    className="absolute inset-0 object-contain object-center w-full h-full p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#e5e5e5]" />
                  </div>
                )}
              </div>
              <h3 className="text-[13px] font-medium text-[#1a1a1a] line-clamp-1">
                {product.title}
              </h3>
            </a>
          )
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[13px] text-[#1a1a1a] border border-[#1a1a1a] px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  )
}

const ProductRowSkeleton = () => (
  <div className="border-b border-[#e5e5e5] py-6 px-8 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-5 bg-[#f0f0f0] w-32 mb-2" />
        <div className="h-4 bg-[#f0f0f0] w-16" />
      </div>
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-16 bg-[#f0f0f0]" />
        ))}
      </div>
    </div>
  </div>
)

export default Store
