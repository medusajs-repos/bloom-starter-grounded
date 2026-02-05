import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"
import { formatPrice } from "@/lib/utils/price"
import { useMemo, useRef } from "react"

interface ProductMobileCardProps {
  product: HttpTypes.StoreProduct
  isLast?: boolean
}

interface ColorVariantImage {
  url: string
  alt: string
  colorValue: string
  variantId: string
}

const ProductMobileCard = ({ product, isLast = false }: ProductMobileCardProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const baseHref = countryCode ? `/${countryCode}` : ""
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get color variant thumbnails - one per unique color
  const colorVariantImages = useMemo(() => {
    const colorImages: ColorVariantImage[] = []
    const seenColors = new Set<string>()
    
    // Find the Color option
    const colorOption = product.options?.find(opt => 
      opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'colour'
    )
    
    if (!colorOption || !product.variants) {
      return colorImages
    }
    
    // Get unique color variants with their images from variant.images
    for (const variant of product.variants) {
      const colorOptionValue = variant.options?.find(opt => opt.option_id === colorOption.id)
      if (colorOptionValue?.value && !seenColors.has(colorOptionValue.value)) {
        seenColors.add(colorOptionValue.value)
        
        // Get images from variant.images array
        const variantImages = (variant as any).images as { url: string }[] | undefined
        const thumbnail = variantImages?.[0]?.url || variant.thumbnail || product.thumbnail
        
        if (thumbnail) {
          colorImages.push({
            url: thumbnail,
            alt: `${product.title} - ${colorOptionValue.value}`,
            colorValue: colorOptionValue.value,
            variantId: variant.id
          })
        }
      }
    }
    
    return colorImages
  }, [product])

  // Fallback: Get images from first variant if no color variants
  const productImages = useMemo(() => {
    if (colorVariantImages.length > 0) return []
    
    const images: { url: string; alt: string }[] = []
    const seenUrls = new Set<string>()
    
    // Get images from first variant
    const firstVariant = product.variants?.[0] as any
    const variantImages = firstVariant?.images as { url: string }[] | undefined
    
    if (variantImages && variantImages.length > 0) {
      variantImages.forEach(img => {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url)
          images.push({ url: img.url, alt: product.title })
        }
      })
    }
    
    // Fallback to product thumbnail if no variant images
    if (images.length === 0 && product.thumbnail) {
      images.push({ url: product.thumbnail, alt: product.title })
    }
    
    return images
  }, [product, colorVariantImages.length])

  // Get price info
  const price = useMemo(() => {
    const variant = product.variants?.[0]
    if (!variant?.calculated_price) return null
    
    const amount = variant.calculated_price.calculated_amount
    const currencyCode = variant.calculated_price.currency_code
    
    if (amount === null || amount === undefined || !currencyCode) return null
    
    return formatPrice({
      amount,
      currency_code: currencyCode,
    })
  }, [product])

  // Get feature highlight from product metadata
  const featureHighlight = useMemo(() => {
    if (product.metadata?.["Feature Highlight"]) {
      return String(product.metadata["Feature Highlight"])
    }
    return null
  }, [product])

  const productHref = `${baseHref}/products/${product.handle}`

  return (
    <div className={`py-4 border-b border-[#ebebeb] ${isLast ? 'border-b-0' : ''}`}>
      {/* Horizontal scrolling images */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {colorVariantImages.length > 0 ? (
          colorVariantImages.map((img) => (
            <Link
              key={`${product.id}-color-${img.colorValue}`}
              to={productHref as any}
              search={{ variant: img.variantId } as any}
              className="w-[120px] h-[150px] bg-[#f7f7f7] overflow-hidden relative flex-shrink-0"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
            </Link>
          ))
        ) : productImages.length > 0 ? (
          productImages.map((img, index) => (
            <Link
              key={`${product.id}-img-${index}`}
              to={productHref as any}
              className="w-[120px] h-[150px] bg-[#f7f7f7] overflow-hidden relative flex-shrink-0"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
            </Link>
          ))
        ) : (
          <div className="w-[120px] h-[150px] bg-[#f7f7f7] flex items-center justify-center flex-shrink-0">
            <div className="w-8 h-8 bg-[#ebebeb]" />
          </div>
        )}
      </div>

      {/* Product info */}
      <Link to={productHref as any} className="block px-4">
        <h3 className="text-[18px] font-medium text-[#1a1a1a] leading-tight">
          {product.title}
        </h3>
        {price && (
          <p className="text-[14px] text-[#666] mt-1">
            {price}
          </p>
        )}
        {/* Feature highlight and subtitle */}
        {(featureHighlight || product.subtitle) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {featureHighlight && (
              <span className="inline-block px-[5px] py-[3px] bg-black/5 text-[12px] font-medium text-neutral-600 uppercase tracking-wide leading-none">
                {featureHighlight}
              </span>
            )}
            {product.subtitle && (
              <span className="text-[12px] text-neutral-500">
                {product.subtitle}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}

export default ProductMobileCard
