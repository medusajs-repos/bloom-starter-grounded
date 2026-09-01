import { OPTION_VALUES_REFINEMENT } from "@/components/search/refinement-config"
import { Checkbox } from "@/components/ui/checkbox"
import { useMemo } from "react"
import { useRefinementList } from "react-instantsearch"

type Group = {
  title: string
  items: { value: string; label: string; count: number; isRefined: boolean }[]
}

export const OptionValuesRefinement = () => {
  const { items, refine } = useRefinementList(OPTION_VALUES_REFINEMENT)

  const groups = useMemo(() => {
    const byTitle = new Map<string, Group>()

    for (const item of items) {
      const separator = item.value.indexOf(":")

      if (separator <= 0) {
        continue
      }

      const title = item.value.slice(0, separator)
      const label = item.value.slice(separator + 1)

      const group = byTitle.get(title) ?? { title, items: [] }
      group.items.push({
        value: item.value,
        label,
        count: item.count,
        isRefined: item.isRefined,
      })
      byTitle.set(title, group)
    }

    return Array.from(byTitle.values())
  }, [items])

  if (!groups.length) {
    return null
  }

  return (
    <div data-testid="refinement-option-values">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-[16px] font-medium text-black leading-none px-4 py-4">
            {group.title}
          </h3>
          <div className="border-t border-[var(--color-grounded-light-gray)]">
            {group.items.map((item) => (
              <label
                key={item.value}
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-[var(--color-grounded-light-gray)] hover:bg-black/5 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                  aria-label={`${group.title} ${item.label}`}
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
      ))}
    </div>
  )
}

export default OptionValuesRefinement
