import { formatPrice } from "@/lib/utils/price"
import { Link } from "@tanstack/react-router"
import type { Hit as HitType } from "instantsearch.js"

export type StoreProductHit = HitType<{
  title: string | null
  handle: string | null
  thumbnail: string | null
  category?: string[]
  currency_code?: string
  min_price?: number
  original_price?: number
  on_sale?: boolean
}>

type StoreHitRowProps = {
  hit: StoreProductHit
  countryCode: string
  isLast?: boolean
}

export const StoreHitRow = ({ hit, countryCode, isLast }: StoreHitRowProps) => {
  if (!hit.handle) {
    return null
  }

  const title = hit.title ?? ""
  const currencyCode = hit.currency_code || "usd"
  const price =
    typeof hit.min_price === "number"
      ? formatPrice({ amount: hit.min_price, currency_code: currencyCode })
      : null
  const originalPrice =
    hit.on_sale === true &&
    typeof hit.original_price === "number" &&
    typeof hit.min_price === "number" &&
    hit.original_price > hit.min_price
      ? formatPrice({
          amount: hit.original_price,
          currency_code: currencyCode,
        })
      : null

  return (
    <Link
      to="/$countryCode/products/$handle"
      params={{ countryCode, handle: hit.handle }}
      className={`group flex flex-row items-center gap-4 md:grid md:grid-cols-12 md:gap-2 py-4 md:py-2 border-b border-[#ebebeb] hover:bg-[#fafafa] transition-colors px-4 md:px-8 ${
        isLast ? "border-b-0" : ""
      }`}
      data-testid="store-hit"
    >
      <div className="order-2 md:order-1 md:col-span-3 flex-1 space-y-2">
        <h3 className="text-[20px] font-medium text-[#1a1a1a] leading-tight">
          {title}
        </h3>
        {(hit.category?.length ?? 0) > 0 && (
          <p className="text-[14px] text-neutral-600 truncate">
            {hit.category?.join(", ")}
          </p>
        )}
        {price && (
          <p className="text-[16px] text-neutral-600 flex items-center gap-2">
            <span>{price}</span>
            {originalPrice && (
              <span className="line-through text-neutral-400">
                {originalPrice}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="order-1 md:order-2 md:col-start-5 md:col-span-2 h-32 w-24 md:h-auto md:w-full aspect-[4/5] flex-shrink-0 bg-[#f7f7f7] overflow-hidden relative">
        {hit.thumbnail ? (
          <img
            src={hit.thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#ebebeb]" />
          </div>
        )}
        <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
      </div>
    </Link>
  )
}

export default StoreHitRow
