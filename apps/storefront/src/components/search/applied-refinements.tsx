import { XMark } from "@medusajs/icons"
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch"

const ATTRIBUTE_LABELS: Record<string, string> = {
  category: "Category",
  option_values: "Option",
  on_sale: "On sale",
  min_price: "Price",
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

export const AppliedRefinements = () => {
  const { items } = useCurrentRefinements()
  const { canRefine: canClear, refine: clearAll } = useClearRefinements()

  if (!items.length) {
    return null
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 md:px-8 pb-6"
      data-testid="applied-refinements"
    >
      {items.flatMap((item) =>
        item.refinements.map((refinement) => (
          <button
            key={[item.attribute, refinement.type, refinement.value].join(":")}
            onClick={() => item.refine(refinement)}
            className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-3 py-2 text-[13px] leading-none text-black transition-colors"
            data-testid="applied-refinement"
          >
            <span>
              {ATTRIBUTE_LABELS[item.attribute] ?? item.attribute}:{" "}
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
