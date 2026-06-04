import ProductRowCard from "@/components/product-row-card"
import { SortDrawer, SortOption } from "@/components/sort-drawer"
import { FilterDrawer, FilterState } from "@/components/filter-drawer"
import { useProducts, useProductCount } from "@/lib/hooks/use-products"
import { useLoaderData, useNavigate, useRouterState } from "@tanstack/react-router"
import { useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
  serializeOptionValueIds,
} from "@/lib/utils/option-values"

type ViewMode = "list" | "grid"

const Store = () => {
  const { region } = useLoaderData({ from: "/$countryCode/store" })
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  const [viewMode] = useState<ViewMode>("list")
  const [controlsVisible, setControlsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [currentSort, setCurrentSort] = useState<SortOption>("featured")
  const [inStock, setInStock] = useState(false)

  // Parse option value IDs from URL
  const optionValueIds = useMemo(() => {
    const search = (location.search ?? {}) as Record<
      string,
      string | string[] | undefined
    >
    return parseOptionValueIds(search)
  }, [location.search])

  const filters: FilterState = useMemo(
    () => ({ optionValueIds, inStock }),
    [optionValueIds, inStock]
  )

  const handleFiltersChange = (next: FilterState) => {
    setInStock(next.inStock)

    // Build updated search params; also strip `page` when filter changes.
    const currentSearch = (location.search ?? {}) as Record<string, unknown>
    const nextSearch: Record<string, unknown> = { ...currentSearch }

    const serialized = serializeOptionValueIds(next.optionValueIds)
    if (serialized) {
      nextSearch[OPTION_VALUE_QUERY_KEY] = serialized
    } else {
      delete nextSearch[OPTION_VALUE_QUERY_KEY]
    }
    delete nextSearch.page

    // Skip the navigate when nothing actually changed
    const sameKeys =
      Object.keys(currentSearch).length === Object.keys(nextSearch).length &&
      Object.keys(nextSearch).every(
        (k) => (currentSearch as Record<string, unknown>)[k] === nextSearch[k]
      )
    if (sameKeys) {
      return
    }

    navigate({
      to: ".",
      search: nextSearch,
      replace: true,
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < 50) {
        setControlsVisible(true)
      } else if (currentScrollY < lastScrollY) {
        setControlsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        setControlsVisible(false)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useProducts({
    region_id: region.id,
    query_params: { limit: 100 },
    optionValueIds,
  })

  const { data: productCount } = useProductCount({ region_id: region.id })

  // Filter and sort products
  const products = useMemo(() => {
    const rawProducts = data?.pages.flatMap((page) => page.products) || []
    let filtered = [...rawProducts]

    if (inStock) {
      filtered = filtered.filter((product) => {
        return product.variants?.some((variant) => {
          return (variant.inventory_quantity ?? 0) > 0 || !variant.manage_inventory
        })
      })
    }

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
        return sorted
      case "featured":
      default:
        return sorted
    }
  }, [data?.pages, currentSort, inStock])

  // Show the locally-filtered count when an in-store filter (e.g. inStock) is
  // applied, otherwise show the server-side total so we don't surface ghost
  // pages.
  const displayCount = inStock ? products.length : productCount

  return (
    <div className="bg-white min-h-screen overflow-x-hidden leading-none">
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
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <div className="w-full pt-12">
        <div className="pt-4 px-4 pb-16 md:pt-8 md:px-8 md:pb-28">
          <div className="flex items-start">
            <h1 className="text-[40px] md:text-[56px] font-normal text-[#1a1a1a] leading-[0.8] tracking-[-0.02em]">
              All Products
            </h1>
            <span className="text-lg text-black leading-none">
              {displayCount ?? ""}
            </span>
          </div>
        </div>
      </div>

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
