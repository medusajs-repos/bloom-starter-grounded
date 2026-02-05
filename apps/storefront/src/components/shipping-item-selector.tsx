import { Loading } from "@/components/ui/loading"
import { Price } from "@/components/ui/price"
import Radio from "@/components/ui/radio"
import { calculatePriceForShippingOption } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

type ShippingItemSelectorProps = {
  shippingOption: HttpTypes.StoreCartShippingOption;
  cart: HttpTypes.StoreCart;
  isSelected: boolean;
  handleSelect: (optionId: string) => void;
};

// Helper to calculate estimated delivery date
function getEstimatedDeliveryDate(estimatedDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + estimatedDays)
  
  // Format as "Tue, Feb 3" for standard or "tomorrow" for 1 day
  if (estimatedDays === 1) {
    return "tomorrow"
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  }
  return date.toLocaleDateString("en-US", options)
}

const ShippingItemSelector = ({
  shippingOption,
  cart,
  isSelected,
  handleSelect,
}: ShippingItemSelectorProps) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(
    undefined
  )
  const isDisabled =
    shippingOption.price_type === "calculated" &&
    typeof calculatedPrice !== "number"
  const price =
    shippingOption.price_type === "calculated"
      ? calculatedPrice
      : shippingOption.amount

  const isFree = price === 0
  const estimatedDays = (shippingOption.data?.estimated_days as number) || 5
  const estimatedDate = getEstimatedDeliveryDate(estimatedDays)
  const description = shippingOption.data?.description as string | null

  useEffect(() => {
    if (shippingOption.price_type !== "calculated") {
      return
    }

    calculatePriceForShippingOption({
      option_id: shippingOption.id,
    }).then((option) => {
      setCalculatedPrice(option.amount)
    })
  }, [shippingOption.price_type, shippingOption.id])

  return (
    <label
      className={`block transition-all duration-200 ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <div
        className={`p-2 border transition-colors bg-neutral-50 ${
          isSelected
            ? "border-neutral-900"
            : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className={`flex items-center ${isSelected ? "gap-2" : ""}`}>
              <Radio
                checked={isSelected}
                onChange={() => handleSelect(shippingOption.id)}
                disabled={isDisabled}
              />
              <p className="text-base font-medium text-neutral-900">
                {shippingOption.name}
              </p>
            </div>
            <div className="text-right shrink-0">
              {typeof price === "number" ? (
                isFree ? (
                  <span className="text-base font-medium text-neutral-900">FREE</span>
                ) : (
                  <Price
                    price={price}
                    currencyCode={cart.currency_code}
                    textWeight="plus"
                  />
                )
              ) : (
                <Loading className="w-4 h-4" rows={1} />
              )}
            </div>
          </div>
          {description && (
            <p className="text-sm text-neutral-500">
              {description}
            </p>
          )}
          <p className="text-sm font-medium text-neutral-900 mt-1">
            Estimated delivery by {estimatedDate}
          </p>
        </div>
      </div>
    </label>
  )
}

export default ShippingItemSelector
