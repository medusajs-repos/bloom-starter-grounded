import { indexedCurrency, priceAttribute } from "@/lib/search-client"
import { formatPrice } from "@/lib/utils/price"
import { XMark } from "@medusajs/icons"
import type { CurrentRefinementsConnectorParamsItem } from "instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements"
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch"

const ATTRIBUTE_LABELS: Record<string, string> = {
  category: "Category",
  option_values: "Option",
}

const chipClassName =
  "flex items-center gap-2 bg-black/5 hover:bg-black/10 px-3 py-2 text-[13px] leading-none text-black transition-colors"

const attributeLabel = (attribute: string) => {
  if (attribute.startsWith("on_sale_")) {
    return "On sale"
  }

  return ATTRIBUTE_LABELS[attribute] ?? attribute
}

const formatRefinementLabel = (attribute: string, label: string) => {
  if (attribute !== "option_values") {
    return label
  }

  const separator = label.indexOf(":")

  return separator > 0
    ? `${label.slice(0, separator)}: ${label.slice(separator + 1)}`
    : label
}

const priceLabelFor = (
  item: CurrentRefinementsConnectorParamsItem | undefined,
  currencyCode: string
) => {
  if (!item) {
    return undefined
  }

  const format = (amount: number) =>
    formatPrice({ amount, currency_code: indexedCurrency(currencyCode) })

  const min = item.refinements.find((r) => r.operator === ">=")?.value
  const max = item.refinements.find((r) => r.operator === "<=")?.value

  if (typeof min === "number" && typeof max === "number") {
    return `Price: ${format(min)} - ${format(max)}`
  }

  if (typeof min === "number") {
    return `Price: from ${format(min)}`
  }

  if (typeof max === "number") {
    return `Price: up to ${format(max)}`
  }

  return undefined
}

/**
 * A range is two refinements, so it gets one chip that clears both. Removing
 * one edge at a time would run a search per edge and leave a half-applied
 * range on screen in between.
 */
const PriceChip = ({
  label,
  attribute,
}: {
  label: string
  attribute: string
}) => {
  const { refine } = useClearRefinements({ includedAttributes: [attribute] })

  return (
    <button
      onClick={refine}
      className={chipClassName}
      data-testid="applied-refinement"
    >
      <span>{label}</span>
      <XMark className="w-3 h-3 text-neutral-600" />
    </button>
  )
}

export const AppliedRefinements = ({
  currencyCode,
}: {
  currencyCode: string
}) => {
  const { items } = useCurrentRefinements()
  const { canRefine: canClear, refine: clearAll } = useClearRefinements()

  const priceAttributeName = priceAttribute("min_price", currencyCode)
  const priceItem = items.find((item) => item.attribute === priceAttributeName)
  const priceLabel = priceLabelFor(priceItem, currencyCode)

  if (!items.length) {
    return null
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 md:px-8 pb-6"
      data-testid="applied-refinements"
    >
      {priceLabel && (
        <PriceChip label={priceLabel} attribute={priceAttributeName} />
      )}

      {items
        .filter((item) => item.attribute !== priceAttributeName)
        .flatMap((item) =>
          item.refinements.map((refinement) => (
            <button
              key={[item.attribute, refinement.type, refinement.value].join(":")}
              onClick={() => item.refine(refinement)}
              className={chipClassName}
              data-testid="applied-refinement"
            >
              <span>
                {attributeLabel(item.attribute)}:{" "}
                {formatRefinementLabel(item.attribute, String(refinement.label))}
              </span>
              <XMark className="w-3 h-3 text-neutral-600" />
            </button>
          ))
        )}

      {canClear && (
        <button
          onClick={() => clearAll()}
          className="px-3 py-2 text-[13px] leading-none text-neutral-600 underline hover:text-black transition-colors"
          data-testid="clear-refinements"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export default AppliedRefinements
