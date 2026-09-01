import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Loading } from "@/components/ui/loading"
import { SearchHit, type ProductHit } from "@/components/search/search-hit"
import { useSearchSettled } from "@/lib/hooks/use-search-settled"
import {
  PRODUCT_INDEX_NAME,
  SEARCH_HITS_PER_PAGE,
  searchClient,
} from "@/lib/search-client"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { MagnifyingGlass } from "@medusajs/icons"
import { useLocation } from "@tanstack/react-router"
import type { SearchClient } from "instantsearch.js"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch"

const DEBOUNCE_MS = 250

type SearchPanelProps = {
  countryCode: string
  onNavigate: () => void
}

const SearchPanel = ({ countryCode, onNavigate }: SearchPanelProps) => {
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })
  const { items } = useHits<ProductHit>()
  const { status, error } = useInstantSearch()
  const { isSettled, resultsQuery } = useSearchSettled()

  const [inputValue, setInputValue] = useState(query)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hasInput = Boolean(inputValue.trim())

  const hasStaleEmptyQueryHits = hasInput && !resultsQuery

  const hasResults = hasInput && !hasStaleEmptyQueryHits && items.length > 0

  const isLoadingWithNothingToShow =
    hasInput && !hasResults && status !== "error" && (!isSettled || hasStaleEmptyQueryHits)

  return (
    <>
      <div className="flex items-center gap-x-3 border-b border-neutral-200 px-6">
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
          autoFocus
          className="w-full bg-transparent py-4 text-[16px] text-neutral-900 outline-none placeholder:text-neutral-500"
          data-testid="search-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!hasInput ? (
          <p
            className="py-6 text-center text-[13px] text-neutral-500"
            data-testid="search-idle"
          >
            Start typing to search for products.
          </p>
        ) : 
        status === "error" ? (
          <p
            className="py-6 text-center text-[13px] text-red-600"
            data-testid="search-error"
          >
            Couldn&apos;t search products
            {error?.message ? `: ${error.message}` : "."}
          </p>
        ) : 
        hasResults ? (
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-8"
            data-testid="search-results"
          >
            {items.map((hit) => (
              <SearchHit
                key={hit.objectID}
                hit={hit}
                countryCode={countryCode}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : 
        isLoadingWithNothingToShow ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8" data-testid="search-loading">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="aspect-[4/5] w-full animate-pulse bg-neutral-200" />
                <Loading rows={2} height="h-3" className="p-0" />
              </div>
            ))}
          </div>
        ) : (
          <p
            className="py-6 text-center text-[13px] text-neutral-600"
            data-testid="search-no-results"
          >
            No products found for &quot;{resultsQuery}&quot;
          </p>
        )}
      </div>
    </>
  )
}

type SearchDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SearchDrawer = ({ open, onOpenChange }: SearchDrawerProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="bg-white flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="uppercase text-[11px] tracking-widest font-medium text-black">
            Search
          </DrawerTitle>
        </DrawerHeader>
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure hitsPerPage={SEARCH_HITS_PER_PAGE} />
          <SearchPanel
            countryCode={countryCode}
            onNavigate={() => onOpenChange(false)}
          />
        </InstantSearch>
      </DrawerContent>
    </Drawer>
  )
}
