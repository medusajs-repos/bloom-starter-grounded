import { ON_SALE_REFINEMENT } from "@/components/search/refinement-config"
import { clsx } from "clsx"
import { useToggleRefinement } from "react-instantsearch"

export const OnSaleToggle = () => {
  const { value, refine } = useToggleRefinement(ON_SALE_REFINEMENT)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value.isRefined}
      onClick={() => refine(value)}
      data-testid="refinement-on-sale"
      className="w-full flex items-center gap-3 px-4 py-5 border-b border-[var(--color-grounded-light-gray)] hover:bg-black/5 transition-colors cursor-pointer"
    >
      <span
        className={clsx(
          "relative h-5 w-9 flex-shrink-0 transition-colors",
          value.isRefined ? "bg-black" : "bg-neutral-200"
        )}
      >
        <span
          className={clsx(
            "absolute top-[2px] left-[2px] h-4 w-4 bg-white transition-transform",
            value.isRefined && "translate-x-4"
          )}
        />
      </span>
      <span className="text-[16px] leading-none text-black flex-1 text-left">
        On sale
      </span>
      {typeof value.count === "number" && (
        <span className="text-[14px] leading-none text-neutral-500 tabular-nums">
          {value.count}
        </span>
      )}
    </button>
  )
}

export default OnSaleToggle
