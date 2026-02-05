import { DEFAULT_CART_DROPDOWN_FIELDS } from "@/components/cart"
import ProductOptionSelect from "@/components/product-option-select"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { getVariantOptionsKeymap, isVariantInStock } from "@/lib/utils/product"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { ShoppingCart, Heart } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useLocation } from "@tanstack/react-router"
import { isEqual } from "lodash-es"
import { useEffect, useMemo, useRef, useState, memo } from "react"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
  initialOptions?: Record<string, string>;
  hideOptions?: boolean;
  onOptionsChange?: (options: Record<string, string | undefined>) => void;
  externalOptions?: Record<string, string | undefined>;
};

function WishlistButton() {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <button
      className="relative h-20 w-20 bg-black hover:bg-gray-800 transition-colors duration-200"
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => setIsFavorited(!isFavorited)}
    >
      <span className="absolute top-2 right-2 w-[15px] h-[15px] flex items-center justify-center">
        <Heart 
          className="w-[15px] h-[15px] text-white transition-colors duration-200"
          style={isFavorited ? { fill: "currentColor" } : undefined}
        />
      </span>
    </button>
  )
}

const ProductActions = memo(function ProductActions({
  product,
  region,
  disabled,
  initialOptions = {},
  hideOptions = false,
  onOptionsChange,
  externalOptions,
}: ProductActionsProps) {
  const [internalOptions, setInternalOptions] = useState<
    Record<string, string | undefined>
  >(initialOptions)
  
  const selectedOptions = externalOptions ?? internalOptions
  const setSelectedOptions = (options: Record<string, string | undefined>) => {
    setInternalOptions(options)
    onOptionsChange?.(options)
  }
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "dk"

  const addToCartMutation = useAddToCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const { openCart } = useCartDrawer()

  const actionsRef = useRef<HTMLDivElement>(null)

  // Preselect the first variant's options - only run once on mount
  useEffect(() => {
    if (Object.keys(initialOptions).length > 0) {
      // URL params provided initial options
      return
    }
    if (product?.variants?.length) {
      const optionsKeymap = getVariantOptionsKeymap(
        product?.variants?.[0]?.options ?? []
      )
      setInternalOptions(optionsKeymap ?? {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.handle])

  const selectedVariant = useMemo(() => {
    if (!product?.variants || product?.variants.length === 0) {
      return
    }

    // If there's only one variant and no options, select it directly
    if (
      product?.variants.length === 1 &&
      (!product?.options || product?.options.length === 0)
    ) {
      return product?.variants[0]
    }

    const variant = product?.variants.find((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      const matches = isEqual(optionsKeymap, selectedOptions)

      return matches
    })

    return variant
  }, [product?.variants, product?.options, selectedOptions])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    const newOptions = {
      ...selectedOptions,
      [optionId]: value,
    }
    setSelectedOptions(newOptions)
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product?.variants?.some((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      return isEqual(optionsKeymap, selectedOptions)
    })
  }, [product?.variants, selectedOptions])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If no variant is selected, we can't add to cart
    if (!selectedVariant) {
      return false
    }

    return isVariantInStock(selectedVariant)
  }, [selectedVariant])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    addToCartMutation.mutateAsync(
      {
        variant_id: selectedVariant.id,
        quantity: 1,
        country_code: countryCode,
        product,
        variant: selectedVariant,
        region,
      },
      {
        onSuccess: () => {
          openCart()
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-y-6" ref={actionsRef}>
      {/* Options */}
      {!hideOptions && (product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-5">
          {(product.options || []).map((option) => {
            return (
              <div key={option.id}>
                <ProductOptionSelect
                  option={option}
                  current={selectedOptions[option.id]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  data-testid="product-options"
                  disabled={!!disabled || addToCartMutation.isPending}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Add to cart button */}
      <div className="flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || !isValidVariant}
          className="relative flex-1 h-20 bg-black hover:bg-gray-900 text-white font-medium text-[20px] p-2 leading-none text-left flex flex-col items-start justify-start transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-product-button"
        >
          <span className="absolute top-2 right-2 w-[15px] h-[15px] flex items-center justify-center">
            <ShoppingCart className="w-[15px] h-[15px]" />
          </span>
          <span className="text-[16px]">
            {!selectedVariant
              ? "Select variant"
              : !inStock || !isValidVariant
                ? "Out of stock"
                : "Add to cart"}
          </span>
        </button>
        <WishlistButton />
      </div>


    </div>
  )
})

export default ProductActions
