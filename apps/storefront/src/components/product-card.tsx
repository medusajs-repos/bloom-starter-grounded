import ProductPrice from "@/components/product-price"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  // Get thumbnail from first variant's images, fallback to product thumbnail
  const firstVariant = product.variants?.[0] as (ProductCardProps & { images?: { url: string }[] }) | undefined
  const variantImages = firstVariant?.images
  const thumbnail = variantImages?.[0]?.url || product.thumbnail

  return (
    <Link
      to="/$countryCode/products/$handle"
      params={{ countryCode, handle: product.handle || "" as string }}
      className="group flex flex-col w-full"
    >
      {/* Image container */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 relative mb-4">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.title}
            className="absolute inset-0 object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-24 bg-neutral-300/50 rounded-none" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-medium text-[var(--color-grounded-text)] line-clamp-1 group-hover:text-[var(--color-grounded-gray)] transition-colors">
          {product.title}
        </h3>
        <ProductPrice
          product={product}
          variant={product.variants?.[0]}
          className="text-[var(--color-grounded-gray)]"
          priceProps={{
            textSize: "small",
          }}
        />
      </div>
    </Link>
  )
}

export default ProductCard
