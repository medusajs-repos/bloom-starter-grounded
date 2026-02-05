import { formatPrice } from "@/lib/utils/price"
import { clsx } from "clsx"
import { useMemo } from "react"

export type PriceProps = {
  price: number | string;
  type?: "default" | "range" | "discount";
  originalPrice?: {
    price: number | string;
    percentage: string;
  };
  className?: string;
  priceClassName?: string;
  currencyCode: string;
  textSize?: "small" | "base" | "large" | "xlarge";
  textWeight?: "regular" | "plus";
  textColor?: string;
};

export const Price = ({
  price,
  type = "default",
  originalPrice,
  className,
  priceClassName,
  currencyCode,
  textSize = "base",
  textWeight = "regular",
  textColor,
}: PriceProps) => {
  const { formattedPrice, formattedSalePrice } = useMemo(() => {
    if (!currencyCode) {
      return {
        formattedPrice: price,
        formattedSalePrice: originalPrice?.price,
      }
    }
    return {
      formattedPrice:
        typeof price === "string"
          ? price
          : formatPrice({ amount: price, currency_code: currencyCode }),
      formattedSalePrice:
        typeof originalPrice?.price === "string"
          ? originalPrice?.price
          : formatPrice({
              amount: originalPrice?.price || 0,
              currency_code: currencyCode,
            }),
    }
  }, [price, originalPrice, currencyCode])
  return (
    <div className={clsx("flex flex-col justify-center", className?.includes("text-") ? "" : "text-neutral-900", className)}>
      {originalPrice && (
        <p>
          <span className="line-through text-neutral-600">
            {formattedSalePrice}
          </span>
        </p>
      )}
      <span
        className={clsx("leading-none", {
          "text-sm": textSize === "small" && textWeight === "regular",
          "text-sm font-medium": textSize === "small" && textWeight === "plus",
          "text-base": textSize === "base" && textWeight === "regular",
          "text-base font-medium": textSize === "base" && textWeight === "plus",
          "text-lg": textSize === "large" && textWeight === "regular",
          "text-lg font-bold": textSize === "large" && textWeight === "plus",
          "text-xl": textSize === "xlarge" && textWeight === "regular",
          "text-xl font-bold": textSize === "xlarge" && textWeight === "plus",
          "text-blue-500": originalPrice,
        })}
      >
        {type === "range" && "From "}
        <span className={clsx(priceClassName, "leading-none", textSize === "small" ? "text-sm" : textSize === "base" ? "text-base" : textSize === "large" ? "text-lg" : "text-[40px]")} style={{ color: textColor || (originalPrice ? "#1d4ed8" : undefined) }}>
          {type === "discount" && price !== 0 && "- "}
          {formattedPrice}
        </span>
      </span>
    </div>
  )
}
