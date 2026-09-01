import { Checkbox } from "@/components/ui/checkbox"
import {
  useRefinementList,
  type UseRefinementListProps,
} from "react-instantsearch"

type RefinementCheckboxListProps = {
  options: UseRefinementListProps
  title: string
}

export const RefinementCheckboxList = ({
  options,
  title,
}: RefinementCheckboxListProps) => {
  const { items, refine } = useRefinementList(options)

  if (!items.length) {
    return null
  }

  return (
    <div data-testid={`refinement-${options.attribute}`}>
      <h3 className="text-[16px] font-medium text-black leading-none px-4 py-4">
        {title}
      </h3>
      <div className="border-t border-[var(--color-grounded-light-gray)]">
        {items.map((item) => (
          <label
            key={item.value}
            className="w-full flex items-center gap-3 px-4 py-4 border-b border-[var(--color-grounded-light-gray)] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <Checkbox
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              aria-label={item.label}
            />
            <span className="text-[16px] leading-none text-black flex-1">
              {item.label}
            </span>
            <span className="text-[14px] leading-none text-neutral-500 tabular-nums">
              {item.count}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default RefinementCheckboxList
