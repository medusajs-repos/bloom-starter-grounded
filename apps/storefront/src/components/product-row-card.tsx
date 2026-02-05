import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { formatPrice } from "@/lib/utils/price"
import { useMemo, useState } from "react"

interface ProductRowCardProps {
  product: HttpTypes.StoreProduct
  isLast?: boolean
}

interface ColorVariantImage {
  url: string
  hoverUrl: string | null
  alt: string
  colorValue: string
  variantId: string
}

const ProductRowCard = ({ product, isLast = false }: ProductRowCardProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const baseHref = countryCode ? `/${countryCode}` : ""

  // Get color variant thumbnails with hover images - one per unique color
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
        const hoverUrl = variantImages?.[1]?.url || null
        
        if (thumbnail) {
          colorImages.push({
            url: thumbnail,
            hoverUrl,
            alt: `${product.title} - ${colorOptionValue.value}`,
            colorValue: colorOptionValue.value,
            variantId: variant.id
          })
        }
      }
    }
    
    return colorImages.slice(0, 8) // Max 8 color variants
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
    
    return images.slice(0, 8) // Max 8 images
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
  
  // Get first color for default link
  const firstColor = colorVariantImages[0]?.colorValue

  const navigate = useNavigate()
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking the card itself, not a thumbnail
    const target = e.target as HTMLElement
    if (!target.closest('[data-thumbnail-link]')) {
      navigate({ 
        to: productHref as any, 
        search: firstColor ? { color: firstColor } as any : undefined 
      })
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 pt-4 pb-8 md:py-2 border-b border-[#ebebeb] hover:bg-[#fafafa] transition-colors px-4 md:px-8 md:items-center cursor-pointer ${isLast ? 'border-b-0' : ''}`}
    >
      {/* Color variant thumbnails - shown first on mobile, last on desktop */}
      <div className="order-1 md:order-3 md:col-start-5 md:col-span-8 flex gap-2 overflow-x-auto no-scrollbar md:grid md:grid-cols-8">
        {colorVariantImages.length > 0 ? (
          colorVariantImages.map((img) => (
            <Link
              key={`${product.id}-color-${img.colorValue}`}
              to={productHref as any}
              search={{ variant: img.variantId } as any}
              data-thumbnail-link
              className="h-32 w-auto md:h-auto md:w-full bg-[#f7f7f7] overflow-hidden relative aspect-[4/5] group/thumb flex-shrink-0"
            >
              {/* Main thumbnail */}
              <img
                src={img.url}
                alt={img.alt}
                className={`w-full h-full object-cover object-center transition-opacity duration-300 ${img.hoverUrl ? 'group-hover/thumb:opacity-0' : 'group-hover/thumb:scale-105 transition-transform'}`}
                loading="lazy"
              />
              {/* Hover image */}
              {img.hoverUrl && (
                <img
                  src={img.hoverUrl}
                  alt={`${img.alt} - alternate view`}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
            </Link>
          ))
        ) : productImages.length > 0 ? (
          productImages.map((img, index) => (
            <div
              key={`${product.id}-img-${index}`}
              className="h-32 w-auto md:h-auto md:w-full bg-[#f7f7f7] overflow-hidden relative aspect-[4/5] group/thumb flex-shrink-0"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
            </div>
          ))
        ) : (
          <div
            className="h-32 w-auto md:h-auto md:w-full bg-[#f7f7f7] flex items-center justify-center relative aspect-[4/5] flex-shrink-0"
          >
            <div className="w-8 h-8 bg-[#ebebeb] rounded-sm" />
            <div className="absolute inset-0 border-[0.5px] border-black/[0.08] pointer-events-none" />
          </div>
        )}
      </div>

      {/* Product info - shown second on mobile, first on desktop */}
      <div className="order-2 md:order-1 md:col-span-2 md:self-start space-y-2 md:space-y-0">
        {/* Title */}
        <h3 className="text-[20px] md:text-[20px] font-medium text-[#1a1a1a] leading-tight">
          {product.title}
        </h3>
        {/* Price - below title on mobile only */}
        {price && (
          <p className="text-[16px] text-neutral-600 mt-2 md:hidden">
            {price}
          </p>
        )}
        {/* Feature highlight badge and product subtitle */}
        <div className="flex flex-row items-center gap-2 md:mt-2">
          {featureHighlight && (
            <span className="shrink-0 px-[5px] py-[3px] bg-black/5 text-[12px] md:text-[14px] font-medium text-neutral-600 uppercase tracking-wide leading-none w-fit">
              {featureHighlight}
            </span>
          )}
          {product.subtitle && (
            <span className="text-[16px] md:text-[14px] text-neutral-600 truncate">
              {product.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Price - desktop only, column 3-4 */}
      {price && (
        <div className="hidden md:block md:order-2 md:col-start-3 md:col-span-2 md:self-start">
          <p className="text-[14px] text-neutral-600 md:leading-[25px]">
            {price}
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductRowCard
