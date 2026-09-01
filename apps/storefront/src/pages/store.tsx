import { AppliedRefinements } from "@/components/search/applied-refinements"
import { PersistentRefinements } from "@/components/search/persistent-refinements"
import { SearchFilterDrawer } from "@/components/search/search-filter-drawer"
import { SearchPagination } from "@/components/search/search-pagination"
import { SearchSortDrawer } from "@/components/search/search-sort-drawer"
import {
  StoreHitRow,
  type StoreProductHit,
} from "@/components/search/store-hit-row"
import { useSearchSettled } from "@/lib/hooks/use-search-settled"
import {
  PRODUCT_INDEX_NAME,
  STORE_HITS_PER_PAGE,
  searchClient,
} from "@/lib/search-client"
import { productSearchRouting } from "@/lib/search-routing"
import { MagnifyingGlass } from "@medusajs/icons"
import { useLoaderData } from "@tanstack/react-router"
import type { SearchClient } from "instantsearch.js"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
  useStats,
} from "react-instantsearch"

const DEBOUNCE_MS = 250

const MAX_VALUES_PER_FACET = 200

const StoreResults = ({ countryCode }: { countryCode: string }) => {
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })
  const { items } = useHits<StoreProductHit>()
  const { nbHits } = useStats()
  const { status, error } = useInstantSearch()
  const { isSettled, resultsQuery } = useSearchSettled()

  const [inputValue, setInputValue] = useState(query)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hasInput = Boolean(inputValue.trim())

  const hasStaleEmptyQueryHits = hasInput && !resultsQuery

  const hasResults = !hasStaleEmptyQueryHits && items.length > 0

  const isLoadingWithNothingToShow =
    !hasResults && status !== "error" && (!isSettled || hasStaleEmptyQueryHits)

  return (
    <>
      <StoreControls />

      <div className="w-full pt-12">
        <div className="pt-4 px-4 pb-6 md:pt-8 md:px-8">
          <div className="flex items-start">
            <h1 className="text-[40px] md:text-[56px] font-normal text-[#1a1a1a] leading-[0.8] tracking-[-0.02em]">
              All Products
            </h1>
            <span className="text-lg text-black leading-none">
              {isSettled ? nbHits : ""}
            </span>
          </div>
        </div>

        <div className="px-4 md:px-8 pb-6">
          <div className="flex items-center gap-x-3 border-b border-neutral-200 max-w-md">
            <MagnifyingGlass className="flex-shrink-0 text-neutral-500" />
            <input
              type="search"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
                refine(event.target.value)
              }}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full bg-transparent py-3 text-[16px] text-neutral-900 outline-none placeholder:text-neutral-500"
              data-testid="store-search-input"
            />
          </div>
        </div>
      </div>

      <AppliedRefinements />

      <div className="w-full pb-[160px]">
        {status === "error" ? (
          <div
            className="text-center py-24 border-t border-[#e5e5e5]"
            data-testid="store-search-error"
          >
            <p className="text-red-600 text-[13px]">
              Couldn&apos;t load products
              {error?.message ? `: ${error.message}` : "."}
            </p>
          </div>
        ) : hasResults ? (
          <>
            <div className="border-t border-[#e5e5e5]" data-testid="store-hits">
              {items.map((hit, index) => (
                <StoreHitRow
                  key={hit.objectID}
                  hit={hit}
                  countryCode={countryCode}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>

            <SearchPagination />
          </>
        ) : isLoadingWithNothingToShow ? (
          <div className="space-y-0" data-testid="store-loading">
            {Array.from({ length: 6 }, (_, index) => (
              <ProductRowSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24 border-t border-[#e5e5e5]"
            data-testid="store-no-results"
          >
            <p className="text-[#999] text-[13px]">
              {resultsQuery
                ? `No products found for "${resultsQuery}"`
                : "No products found"}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

const StoreControls = () => {
  const [controlsVisible, setControlsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

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

  return (
    <div
      className={`fixed bottom-2 left-2 right-2 md:left-auto md:bottom-auto md:top-[56px] z-50 flex items-center gap-2 transition-transform duration-300 ${
        controlsVisible
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-[calc(100%+8px)] md:translate-y-0 md:translate-x-[calc(100%+8px)]"
      }`}
    >
      <SearchSortDrawer
        open={sortDrawerOpen}
        onOpenChange={setSortDrawerOpen}
      />
      <SearchFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
      />
    </div>
  )
}

const Store = () => {
  const { countryCode } = useLoaderData({ from: "/$countryCode/store" })

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  return (
    <div className="bg-white min-h-screen overflow-x-hidden leading-none">
      {isMounted ? (
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          routing={productSearchRouting}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure
            hitsPerPage={STORE_HITS_PER_PAGE}
            maxValuesPerFacet={MAX_VALUES_PER_FACET}
          />
          <PersistentRefinements />
          <StoreResults countryCode={countryCode} />
        </InstantSearch>
      ) : (
        <StoreShell />
      )}
    </div>
  )
}

const StoreShell = () => (
  <>
    <div className="w-full pt-12">
      <div className="pt-4 px-4 pb-16 md:pt-8 md:px-8 md:pb-28">
        <h1 className="text-[40px] md:text-[56px] font-normal text-[#1a1a1a] leading-[0.8] tracking-[-0.02em]">
          All Products
        </h1>
      </div>
    </div>
    <div className="w-full pb-[160px]">
      {Array.from({ length: 6 }, (_, index) => (
        <ProductRowSkeleton key={`shell-skeleton-${index}`} />
      ))}
    </div>
  </>
)

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
