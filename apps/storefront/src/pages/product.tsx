import ProductActions from "@/components/product-actions"
import ProductPrice from "@/components/product-price"
import ProductVariantSelect from "@/components/product-variant-select"
import { ProductCarousel } from "@/components/ui/product-carousel"
import { useLoaderData, useLocation, Link } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { useLatestProducts } from "@/lib/hooks/use-products"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { Price } from "@/components/ui/price"
import type { HttpTypes } from "@medusajs/types"
import { ProductInfoDrawer } from "@/components/product-info-drawer"
import { ShoppingCart } from "@medusajs/icons"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { isVariantInStock } from "@/lib/utils/product"


const ProductDetails = () => {
  const { product, region } = useLoaderData({
    from: "/$countryCode/products/$handle",
  })
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)

  // Local state for selected variant ID
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.[0]?.id
  )
  
  // Floating button visibility
  const addToCartRef = useRef<HTMLDivElement>(null)
  const [isPastAddToCart, setIsPastAddToCart] = useState(false)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const lastScrollY = useRef(0)
  const addToCartMutation = useAddToCart()
  const { openCart } = useCartDrawer()
  
  // Show floating button when past main button AND scrolling up AND user has started scrolling
  const showFloatingButton = hasScrolled && isPastAddToCart && isScrollingUp

  // Preselect the first variant on mount
  useEffect(() => {
    if (product?.variants?.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product?.variants, selectedVariantId])
  
  // Enable transitions after mount to prevent initial animation
  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])
  
  // Track when the add to cart button scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPastAddToCart(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    )
    
    if (addToCartRef.current) {
      observer.observe(addToCartRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  // Track scroll direction - show when scrolling up, hide when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (!hasScrolled) {
        setHasScrolled(true)
      }
      
      if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsScrollingUp(true)
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsScrollingUp(false)
      }
      
      lastScrollY.current = currentScrollY
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [hasScrolled])

  // Get the selected variant
  const selectedVariant = useMemo(() => {
    if (!product.variants?.length || !selectedVariantId) return null
    return product.variants.find((v) => v.id === selectedVariantId) || null
  }, [product.variants, selectedVariantId])

  // Convert selected variant to options map for ProductActions
  const selectedOptions = useMemo(() => {
    if (!selectedVariant?.options) return {}
    const options: Record<string, string> = {}
    for (const opt of selectedVariant.options) {
      if (opt.option_id) {
        options[opt.option_id] = opt.value ?? ""
      }
    }
    return options
  }, [selectedVariant])

  // Check if selected variant is in stock
  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    return isVariantInStock(selectedVariant)
  }, [selectedVariant])
  
  // Handle floating add to cart
  const handleFloatingAddToCart = () => {
    if (!selectedVariant?.id || !countryCode) return
    
    addToCartMutation.mutate(
      {
        variant_id: selectedVariant.id,
        quantity: 1,
        country_code: countryCode,
        product,
        variant: selectedVariant,
        region,
      },
      {
        onSuccess: () => openCart(),
      }
    )
  }

  // Use variant images if available, otherwise fall back to product images
  const displayImages = useMemo(() => {
    const variantImages = (selectedVariant as HttpTypes.StoreProductVariant & { images?: HttpTypes.StoreProductImage[] })?.images
    if (variantImages?.length) {
      return variantImages
    }
    return product.images || []
  }, [selectedVariant, product.images])

  return (
    <div className="bg-white min-h-screen pt-12 relative flex flex-col gap-2">
      {/* Full-width image carousel at top */}
      {displayImages.length > 0 && (
        <div className="w-full">
          <ProductCarousel key={selectedVariant?.id || "default"} images={displayImages} />
        </div>
      )}

      {/* Product info section below carousel */}
      <div className="w-full px-2 py-10 md:py-16">
        <div className="flex flex-col w-full md:w-1/2 md:ml-auto px-4 md:px-0 md:pr-8">
          {/* Product title with feature highlight badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[40px] font-medium text-neutral-900 leading-tight">
              {product.title}
            </h1>
            {typeof product.metadata?.["Feature Highlight"] === "string" && (
              <span className="inline-block px-[5px] py-[3px] bg-black/5 text-[14px] font-medium text-neutral-600 uppercase tracking-wide leading-none">
                {product.metadata["Feature Highlight"]}
              </span>
            )}
          </div>
          
          {/* Price */}
          <ProductPrice 
            product={product} 
            variant={selectedVariant ?? undefined}
            className="text-black/60"
            priceProps={{ textSize: "xlarge" }}
          />
          
          {/* Divider */}
          <div className="w-full h-px bg-neutral-200 my-4" />
          
          {/* Variant picker - full width */}
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-5 mt-4">
              <ProductVariantSelect
                variants={product.variants || []}
                selectedVariantId={selectedVariantId}
                onVariantChange={setSelectedVariantId}
                data-testid="product-variants"
              />
            </div>
          )}
          
          {/* Add to cart section - full width, below content */}
          <div className="w-full mt-16" ref={addToCartRef}>
            <ProductActions 
              product={product} 
              region={region} 
              hideOptions={true}
              externalOptions={selectedOptions}
            />
          </div>
        </div>
      </div>

      {/* Two image section */}
      <div className="w-full flex gap-2 px-2">
        <div className="w-1/2 aspect-[4/5] overflow-hidden relative">
          <img 
            src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/78172a4e-850d-4850-8ec6-60ec36fd086d-01KG1ZATR7EYJ9KM4J0YC2QVH6.png" 
            alt="Chair with textile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-[0.5px] border-black/10 pointer-events-none" />
        </div>
        <div className="w-1/2 aspect-[4/5] overflow-hidden relative">
          <img 
            src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/e95cbc74-c384-4c38-96a6-ad6ac31bc387-01KG1ZCH1R11FCHWE8RTNEXYR9.png" 
            alt="Japanese kitchen interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-[0.5px] border-black/10 pointer-events-none" />
        </div>
      </div>

      {/* Full width image section */}
      <div className="w-full px-2">
        <div className="relative w-full aspect-[8/5] overflow-hidden bg-stone-100">
          <img 
            src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/bf32e9df-a92c-4a92-b875-cb8748c1f38c-01KG21EMZ95V008W31J8KXA14P.png" 
            alt="Bathroom shelf with amber jars and rolled towels"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-[0.5px] border-black/10 pointer-events-none" />
        </div>
      </div>

      {/* Tagline section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-2 bg-black/5 mx-4 md:mx-2">
          {/* Left column - empty for offset */}
          <div className="hidden md:block w-1/2" />
          
          {/* Right column - tagline text */}
          <div className="w-full py-16">
            <div className="flex flex-col gap-2 w-full md:pr-8">
              {product.description && (
                <p className="text-[40px] leading-[1.15] tracking-[-0.01em] text-neutral-900">{product.description}</p>
              )}
              <div className="flex flex-col gap-2 mt-8">
                <ProductInfoDrawer product={product} type="measurements" />
                <ProductInfoDrawer product={product} type="composition" />
                <ProductInfoDrawer product={product} type="availability" />
                <ProductInfoDrawer product={product} type="shipping" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like section */}
      <YouMayAlsoLike 
        currentProductId={product.id}
        regionId={region?.id}
        currencyCode={region?.currency_code || "usd"}
        countryCode={countryCode || "us"}
      />
      
      {/* Floating Add to Cart Button */}
      <div 
        className={`fixed bottom-2 left-2 right-2 md:left-auto md:bottom-auto md:top-[56px] md:right-4 z-50 translate-y-[calc(100%+16px)] md:translate-y-0 md:translate-x-[calc(100%+16px)] ${
          hasMounted ? "transition-transform duration-300" : ""
        } ${
          showFloatingButton ? "!translate-y-0 md:!translate-x-0" : ""
        }`}
      >
        <button
          onClick={handleFloatingAddToCart}
          disabled={!inStock || !selectedVariant || addToCartMutation.isPending}
          className="relative w-full md:w-[128px] h-[72px] md:h-[128px] flex items-end justify-start p-2 text-[16px] leading-none text-white bg-black hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute top-2 right-2 w-[15px] h-[15px] flex items-center justify-center">
            <ShoppingCart className="w-[15px] h-[15px]" />
          </span>
          <span className="text-[16px] leading-[100%]">
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  )
}

// You May Also Like Section
interface YouMayAlsoLikeProps {
  currentProductId: string
  regionId?: string
  currencyCode: string
  countryCode: string
}

const YouMayAlsoLike = ({ currentProductId, regionId, currencyCode, countryCode }: YouMayAlsoLikeProps) => {
  const { data: productsData, isLoading } = useLatestProducts({ limit: 8, region_id: regionId })

  // Filter out the current product and flatten to variants
  const filteredProducts = productsData?.products?.filter(p => p.id !== currentProductId) || []
  
  // Smart logic: prioritize showing different products first, then fill with variants
  const targetCount = 4
  const variantItems: Array<{
    product: HttpTypes.StoreProduct
    variant: HttpTypes.StoreProductVariant
    colorValue: string
    colorOption: HttpTypes.StoreProductOption
  }> = []
  
  // First pass: add one variant per product (prioritize unique products)
  for (const product of filteredProducts) {
    if (variantItems.length >= targetCount) break
    
    const colorOption = product.options?.find(opt => opt.title?.toLowerCase() === "color")
    const firstVariant = product.variants?.[0]
    
    if (firstVariant) {
      const colorOptionValue = firstVariant.options?.find((opt) => {
        const optWithOption = opt as typeof opt & { option?: { title?: string } }
        return optWithOption.option?.title?.toLowerCase() === "color"
      })
      const colorValue = colorOptionValue?.value || ""

      variantItems.push({
        product,
        variant: firstVariant as HttpTypes.StoreProductVariant,
        colorValue,
        colorOption: colorOption as HttpTypes.StoreProductOption,
      })
    }
  }
  
  // Second pass: if we still need more, add additional variants from products already shown
  if (variantItems.length < targetCount) {
    for (const product of filteredProducts) {
      if (variantItems.length >= targetCount) break
      
      const colorOption = product.options?.find(opt => opt.title?.toLowerCase() === "color")
      const variants = product.variants || []
      
      // Skip the first variant (already added), add remaining variants
      for (let i = 1; i < variants.length; i++) {
        if (variantItems.length >= targetCount) break

        const variant = variants[i]
        const colorOptionValue = variant.options?.find((opt) => {
          const optWithOption = opt as typeof opt & { option?: { title?: string } }
          return optWithOption.option?.title?.toLowerCase() === "color"
        })
        const colorValue = colorOptionValue?.value || ""

        variantItems.push({
          product,
          variant: variant as HttpTypes.StoreProductVariant,
          colorValue,
          colorOption: colorOption as HttpTypes.StoreProductOption,
        })
      }
    }
  }

  if (isLoading || variantItems.length === 0) {
    return null
  }

  return (
    <div className="w-full px-2 py-16">
      <h2 className="text-[32px] font-light leading-none text-neutral-900 mb-8 px-4 md:px-8">
        You may also like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {variantItems.map((item, idx) => (
          <RecommendedVariantCard
            key={`${item.product.id}-${item.variant.id}-${idx}`}
            product={item.product}
            variant={item.variant}
            colorValue={item.colorValue}
            currencyCode={currencyCode}
            countryCode={countryCode}
          />
        ))}
      </div>
    </div>
  )
}

// Recommended Variant Card for the product page - shows individual variants
interface RecommendedVariantCardProps {
  product: HttpTypes.StoreProduct
  variant: HttpTypes.StoreProductVariant
  colorValue: string
  currencyCode: string
  countryCode: string
}

const RecommendedVariantCard = ({ product, variant, colorValue, currencyCode, countryCode }: RecommendedVariantCardProps) => {
  // Get all color variants for this product
  const colorOption = product.options?.find(
    opt => opt.title?.toLowerCase() === "color" || opt.title?.toLowerCase() === "colour"
  )
  
  // Build a map of color -> variant data
  const colorVariants = React.useMemo(() => {
    if (!colorOption || !product.variants) return []

    const variants: { color: string; variant: HttpTypes.StoreProductVariant; thumbnail: string | null }[] = []
    const seenColors = new Set<string>()

    for (const v of product.variants) {
      const colorOptValue = v.options?.find(
        opt => opt.option_id === colorOption.id
      )?.value

      if (colorOptValue && !seenColors.has(colorOptValue)) {
        seenColors.add(colorOptValue)
        const variantImages = (v as HttpTypes.StoreProductVariant & { images?: { url: string }[] })?.images
        variants.push({
          color: colorOptValue,
          variant: v,
          thumbnail: variantImages?.[0]?.url || product.thumbnail
        })
      }
    }
    return variants
  }, [product, colorOption])

  // Track currently selected color
  const [selectedColor, setSelectedColor] = React.useState(colorValue)
  
  // Get current variant data based on selected color
  const currentVariantData = colorVariants.find(cv => cv.color === selectedColor) || {
    color: colorValue,
    variant: variant,
    thumbnail: (variant as HttpTypes.StoreProductVariant & { images?: { url: string }[] })?.images?.[0]?.url || product.thumbnail
  }
  
  const price = currentVariantData.variant?.calculated_price?.calculated_amount || 0
  const thumbnail = currentVariantData.thumbnail

  // Map color names to actual colors
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      "black": "#1a1a1a",
      "white": "#f5f5f5",
      "cream": "#f5f5dc",
      "beige": "#d4c5b5",
      "sage": "#9dc183",
      "green": "#4a7c59",
      "blue": "#5b7fa3",
      "navy": "#1e3a5f",
      "gray": "#808080",
      "grey": "#808080",
      "brown": "#8b6f47",
      "tan": "#d2b48c",
      "pink": "#e8b4b8",
      "rose": "#c08081",
      "coral": "#ff7f50",
      "orange": "#e57c3a",
      "yellow": "#e5c03a",
      "red": "#c44536",
      "charcoal": "#36454f",
      "camel": "#c19a6b",
      "slate": "#708090",
      "ivory": "#fffff0",
      "blush": "#de98ab",
      "terracotta": "#c75b3a",
      "walnut": "#5d432c",
      "oak": "#c4a35a",
      "natural": "#e8dcc8",
      "espresso": "#3c2415",
      "mahogany": "#c04000",
      "teak": "#b08451",
      "ash": "#b2beb5",
      "ebony": "#282828",
      "sand": "#c2b280",
      "olive": "#6b7d46",
      "mustard": "#d4a934",
      "burgundy": "#722f37",
      "plum": "#6b4a5c",
      "teal": "#3c7a7a",
      "rust": "#b7410e",
      "pewter": "#8b8d8e",
      "silver": "#c0c0c0",
      "gold": "#c5a44a",
      "bronze": "#a87e4f",
      "copper": "#b87333",
    }
    const lower = colorName.toLowerCase()
    return colorMap[lower] || "#cccccc"
  }

  return (
    <div className="group block">
      <Link 
        to="/$countryCode/products/$handle"
        params={{ countryCode, handle: product.handle || "" }}
      >
        <div className="relative aspect-[3/4] bg-[#f5f3ef] overflow-hidden">
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={`${product.title} - ${selectedColor}`} 
              className="w-full h-full object-cover transition-opacity duration-200"
            />
          )}
          <div className="absolute inset-0 border-[0.5px] border-black/10 pointer-events-none" />
        </div>
      </Link>
      <div className="p-4 pb-4 md:px-8 md:pt-8 md:pb-0">
        <Link 
          to="/$countryCode/products/$handle"
          params={{ countryCode, handle: product.handle || "" }}
        >
          <h4 className="text-base font-medium text-neutral-900 truncate leading-none">
            {product.title}
          </h4>
          <div className="text-[13px] text-neutral-500 mt-0.5">
            <Price price={price} currencyCode={currencyCode} textSize="base" textColor="text-black/70" />
          </div>
        </Link>
        {colorVariants.length > 0 && (
          <div className="flex gap-1.5 mt-8">
            {colorVariants.map((cv) => (
              <button
                key={cv.color}
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedColor(cv.color)
                }}
                className={`h-3 rounded-full transition-all duration-200 ${
                  selectedColor === cv.color 
                    ? "w-6" 
                    : "w-3"
                }`}
                style={{ 
                  backgroundColor: getColorHex(cv.color),
                  boxShadow: "inset 0 0 0 0.5px rgba(0, 0, 0, 0.1)"
                }}
                title={cv.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
