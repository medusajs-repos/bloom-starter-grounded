import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import React from "react"

type ProductVariantSelectProps = {
  variants: HttpTypes.StoreProductVariant[];
  selectedVariantId: string | undefined;
  onVariantChange: (variantId: string) => void;
  disabled?: boolean;
  "data-testid"?: string;
};

const ProductVariantSelect: React.FC<ProductVariantSelectProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  disabled = false,
  "data-testid": dataTestId,
}) => {
  // Check if variants have a color option
  const hasColorOption = variants.some((v) =>
    v.options?.some((o) => o.option?.title?.toLowerCase() === "color")
  )

  // Get the variant's display name (use color if available, otherwise first option value or title)
  const getVariantLabel = (variant: HttpTypes.StoreProductVariant): string => {
    const colorOption = variant.options?.find(
      (o) => o.option?.title?.toLowerCase() === "color"
    )
    if (colorOption) {
      return colorOption.value ?? variant.title ?? "Variant"
    }
    // Fall back to first option value or title
    const firstOption = variant.options?.[0]
    return firstOption?.value ?? variant.title ?? "Variant"
  }

  // Get color value for color swatches
  const getVariantColor = (variant: HttpTypes.StoreProductVariant): string | null => {
    const colorOption = variant.options?.find(
      (o) => o.option?.title?.toLowerCase() === "color"
    )
    if (colorOption?.value) {
      return getColorValue(colorOption.value)
    }
    return null
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const selectedLabel = selectedVariant ? getVariantLabel(selectedVariant) : null

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-[16px] font-medium text-neutral-900">
        {hasColorOption && selectedLabel ? selectedLabel : "Select variant"}
      </span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {variants.map((variant) => {
          const isActive = variant.id === selectedVariantId
          const color = getVariantColor(variant)
          const label = getVariantLabel(variant)

          // Color swatch styling
          if (hasColorOption && color) {
            return (
              <button
                onClick={() => onVariantChange(variant.id)}
                key={variant.id}
                className={clsx(
                  "rounded-full transition-all duration-200",
                  {
                    "h-6 w-12": isActive,
                    "h-6 w-6": !isActive,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
                disabled={disabled}
                data-testid="variant-button"
                title={label}
                style={{ 
                  backgroundColor: color,
                  boxShadow: "inset 0 0 0 0.5px rgba(0, 0, 0, 0.1)"
                }}
              />
            )
          }

          // Default button styling for non-color variants
          return (
            <button
              onClick={() => onVariantChange(variant.id)}
              key={variant.id}
              className={clsx(
                "text-sm font-medium px-5 py-2.5 transition-all duration-200 min-w-[60px]",
                {
                  "bg-[#0A4AFD] text-white": isActive,
                  "bg-neutral-100 text-neutral-700 hover:bg-neutral-200":
                    !isActive && !disabled,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              data-testid="variant-button"
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to get color value from color name
function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    // Grays & Neutrals
    black: "#1a1a1a",
    white: "#ffffff",
    charcoal: "#36454f",
    ghost: "#f8f8ff",
    pearl: "#f0ead6",
    oat: "#d9c8a9",
    gray: "#808080",
    grey: "#808080",
    silver: "#c0c0c0",
    slate: "#708090",
    ivory: "#fffff0",

    // Blues
    blue: "#0066cc",
    "ultra marine": "#4166f5",
    ultramarine: "#4166f5",
    navy: "#000080",

    // Pinks & Reds
    pink: "#ffc0cb",
    blush: "#de5d83",
    "bubble gum": "#ffc1cc",
    "dusty rose": "#dcae96",
    rose: "#ff007f",
    red: "#cc0000",
    terracotta: "#e2725b",

    // Greens
    green: "#228b22",
    sage: "#9dc183",
    "mossy green": "#8a9a5b",
    olive: "#808000",

    // Earth tones
    brown: "#8b4513",
    tan: "#d2b48c",
    camel: "#c19a6b",
    beige: "#f5f5dc",

    // Others
    yellow: "#ffd700",
    orange: "#ff8c00",
    purple: "#800080",
  }

  const normalized = colorName.toLowerCase()
  return colorMap[normalized] || "#e5e5e5"
}

export default ProductVariantSelect
