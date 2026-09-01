import { Price } from "@/components/ui/price"
import { getPricePercentageDiff } from "@/lib/utils/price"
import { Link } from "@tanstack/react-router"
import type { Hit as HitType } from "instantsearch.js"

export type ProductHit = HitType<{
  title: string | null
  handle: string | null
  thumbnail: string | null
  currency_code?: string
  min_price?: number
  original_price?: number
  on_sale?: boolean
}>

type SearchHitProps = {
  hit: ProductHit
  countryCode: string
  onNavigate: () => void
}

export const SearchHit = ({ hit, countryCode, onNavigate }: SearchHitProps) => {
  if (!hit.handle) {
    return null
  }

  const title = hit.title ?? ""
  const hasPrice = typeof hit.min_price === "number"
  const isDiscounted =
    hit.on_sale === true &&
    typeof hit.original_price === "number" &&
    typeof hit.min_price === "number" &&
    hit.original_price > hit.min_price

  return (
    <Link
      to="/$countryCode/products/$handle"
      params={{ countryCode, handle: hit.handle }}
      onClick={onNavigate}
      className="group flex flex-col w-full"
      data-testid="search-hit"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 relative mb-3">
        {hit.thumbnail ? (
          <img
            src={hit.thumbnail}
            alt={title}
            className="absolute inset-0 object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-24 bg-neutral-300/50 rounded-none" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-medium text-[var(--color-grounded-text)] line-clamp-1 group-hover:text-[var(--color-grounded-gray)] transition-colors">
          {title}
        </h3>
        {hasPrice && (
          <Price
            price={hit.min_price as number}
            currencyCode={hit.currency_code || "usd"}
            type="range"
            textSize="small"
            className="text-[var(--color-grounded-gray)]"
            originalPrice={
              isDiscounted
                ? {
                    price: hit.original_price as number,
                    percentage: getPricePercentageDiff(
                      hit.original_price as number,
                      hit.min_price as number
                    ),
                  }
                : undefined
            }
          />
        )}
      </div>
    </Link>
  )
}
