import { PRICE_REFINEMENT } from "@/components/search/refinement-config"
import { formatPrice } from "@/lib/utils/price"
import { useEffect, useState } from "react"
import { useRange } from "react-instantsearch"

const INDEX_CURRENCY_CODE = "usd"

export const PriceRangeRefinement = () => {
  const { start, range, canRefine, refine } = useRange(PRICE_REFINEMENT)

  const [min, max] = start
  const boundsMin = range.min
  const boundsMax = range.max

  const [draft, setDraft] = useState({ min: "", max: "" })

  useEffect(() => {
    setDraft({
      min: Number.isFinite(min) ? String(min) : "",
      max: Number.isFinite(max) ? String(max) : "",
    })
  }, [min, max])

  const commit = () => {
    refine([
      draft.min === "" ? undefined : Number(draft.min),
      draft.max === "" ? undefined : Number(draft.max),
    ])
  }

  if (!canRefine || boundsMin === undefined || boundsMax === undefined) {
    return null
  }

  return (
    <div data-testid="refinement-price">
      <h3 className="text-[16px] font-medium text-black leading-none px-4 py-4">
        Price
      </h3>
      <form
        className="flex items-center gap-2 px-4 pb-5 border-b border-[var(--color-grounded-light-gray)]"
        onSubmit={(event) => {
          event.preventDefault()
          commit()
        }}
      >
        <input
          type="number"
          inputMode="decimal"
          min={boundsMin}
          max={boundsMax}
          step="any"
          value={draft.min}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, min: event.target.value }))
          }
          onBlur={commit}
          placeholder={formatPrice({
            amount: boundsMin,
            currency_code: INDEX_CURRENCY_CODE,
            maximumFractionDigits: 0,
          })}
          aria-label="Minimum price"
          className="w-full border border-neutral-200 px-3 py-2 text-[16px] text-black outline-none focus:border-black"
          data-testid="price-min"
        />
        <span className="text-[14px] text-neutral-500">to</span>
        <input
          type="number"
          inputMode="decimal"
          min={boundsMin}
          max={boundsMax}
          step="any"
          value={draft.max}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, max: event.target.value }))
          }
          onBlur={commit}
          placeholder={formatPrice({
            amount: boundsMax,
            currency_code: INDEX_CURRENCY_CODE,
            maximumFractionDigits: 0,
          })}
          aria-label="Maximum price"
          className="w-full border border-neutral-200 px-3 py-2 text-[16px] text-black outline-none focus:border-black"
          data-testid="price-max"
        />
        <button
          type="submit"
          className="flex-shrink-0 border border-black px-3 py-2 text-[14px] leading-none text-black hover:bg-black hover:text-white transition-colors"
        >
          Go
        </button>
      </form>
    </div>
  )
}

export default PriceRangeRefinement
