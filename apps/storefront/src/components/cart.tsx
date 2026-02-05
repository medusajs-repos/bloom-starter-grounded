import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { Price } from "@/components/ui/price"
import { Thumbnail } from "@/components/ui/thumbnail"
import {
  useCart,
  useDeleteLineItem,
  useUpdateLineItem,
  useApplyPromoCode,
  useRemovePromoCode,
  useAddToCart,
} from "@/lib/hooks/use-cart"
import { useLatestProducts } from "@/lib/hooks/use-products"
import { useRegion } from "@/lib/hooks/use-regions"
import { sortCartItems } from "@/lib/utils/cart"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { getPricePercentageDiff } from "@/lib/utils/price"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { Trash, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"
import { clsx } from "clsx"
import { useState } from "react"



type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
  className?: string
}

export const LineItemPrice = ({ item, currencyCode, className }: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice && originalPrice && currentPrice < originalPrice

  return (
    <Price
      price={currentPrice || 0}
      currencyCode={currencyCode}
      originalPrice={
        hasReducedPrice
          ? {
              price: originalPrice || 0,
              percentage: getPricePercentageDiff(originalPrice || 0, currentPrice || 0),
            }
          : undefined
      }
      className={className}
    />
  )
}


type CartDeleteItemProps = {
  item: HttpTypes.StoreCartLineItem
  fields?: string
}

export const CartDeleteItem = ({ item, fields }: CartDeleteItemProps) => {
  const deleteLineItemMutation = useDeleteLineItem({ fields })
  return (
    <button
      onClick={() => deleteLineItemMutation.mutate({ line_id: item.id })}
      disabled={deleteLineItemMutation.isPending}
      className="text-[var(--color-grounded-gray)] hover:text-[var(--color-grounded-text)] transition-colors"
    >
      <Trash className="w-4 h-4" />
    </button>
  )
}

const RemoveItemButton = ({ item, fields }: CartDeleteItemProps) => {
  const deleteLineItemMutation = useDeleteLineItem({ fields })
  return (
    <button
      onClick={() => deleteLineItemMutation.mutate({ line_id: item.id })}
      disabled={deleteLineItemMutation.isPending}
      className="text-[14px] font-medium text-black underline decoration-black hover:text-neutral-600 hover:decoration-neutral-600 hover:cursor-pointer transition-all disabled:opacity-50"
    >
      Remove
    </button>
  )
}


type CartItemQuantitySelectorProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "default" | "compact"
  fields?: string
}

export const CartItemQuantitySelector = ({
  item,
  fields,
}: CartItemQuantitySelectorProps) => {
  const updateLineItemMutation = useUpdateLineItem({ fields })
  const deleteLineItemMutation = useDeleteLineItem({ fields })

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      deleteLineItemMutation.mutate({ line_id: item.id })
    } else {
      updateLineItemMutation.mutate({
        line_id: item.id,
        quantity: newQuantity,
      })
    }
  }

  return (
    <div className="flex items-center border border-[var(--color-grounded-light-gray)] rounded-none">
      <button
        onClick={() => handleQuantityChange(item.quantity - 1)}
        className="w-8 h-8 grid place-items-center text-[var(--color-grounded-gray)] hover:text-[var(--color-grounded-text)] hover:bg-neutral-100 hover:cursor-pointer transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <span className="w-8 h-8 grid place-items-center text-[16px] text-[var(--color-grounded-text)]">
        {item.quantity}
      </span>
      <button
        onClick={() => handleQuantityChange(item.quantity + 1)}
        className="w-8 h-8 grid place-items-center text-[var(--color-grounded-gray)] hover:text-[var(--color-grounded-text)] hover:bg-neutral-100 hover:cursor-pointer transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}


interface CartLineItemProps {
  item: HttpTypes.StoreCartLineItem
  cart: HttpTypes.StoreCart
  type?: "default" | "compact" | "display"
  fields?: string
  className?: string
  onClose?: () => void
  countryCode?: string
}

const CompactCartLineItem = ({ item, cart, fields, onClose, countryCode = "us" }: CartLineItemProps) => {
  return (
    <div className="flex gap-4 p-4 border-b border-[var(--color-grounded-light-gray)] last:border-b-0" data-testid="cart-item">
      <Link to="/$countryCode/products/$handle" params={{ countryCode, handle: item.product_handle || "" }} onClick={onClose} className="w-32 h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex-shrink-0 overflow-hidden rounded-none relative block">
        {item.thumbnail && (
          <img src={item.thumbnail} alt={item.product_title || item.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 rounded-none pointer-events-none" style={{ border: "0.5px solid rgba(0,0,0,0.08)" }} />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-[16px] font-medium text-[var(--color-grounded-text)] line-clamp-1 flex-1">
              {item.product_title}
            </h4>
            <span className="text-[16px] font-medium text-[var(--color-grounded-text)] flex-shrink-0 ml-4">
              <Price price={item.total || 0} currencyCode={cart.currency_code} textSize="base" textWeight="plus" />
            </span>
          </div>
          {item.variant_title && item.variant_title !== "Default Variant" && (
            <span className="text-[16px] text-[var(--color-grounded-gray)]">{item.variant_title}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <CartItemQuantitySelector item={item} fields={fields} type="compact" />
          <RemoveItemButton item={item} fields={fields} />
        </div>
      </div>
    </div>
  )
}

const DisplayCartLineItem = ({ item, cart, className }: CartLineItemProps) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 text-base text-black [&:not(:last-child)]:pb-4 [&:not(:first-child)]:pt-4",
        className
      )}
    >
      <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 flex-shrink-0 relative">
        {item.thumbnail && (
          <img src={item.thumbnail} alt={item.product_title || item.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }} />
      </div>
      <div className="flex-1 flex flex-col justify-between self-stretch">
        <div>
          <p className="text-[16px] font-medium text-black leading-none">{item.product_title}</p>
          {item.variant_title && item.variant_title !== "Default Variant" && (
            <p className="text-[16px] text-black/60">{item.variant_title}</p>
          )}
        </div>
        <p className="text-[16px] text-black/60 leading-none">Qty: {item.quantity}</p>
      </div>
      <div className="text-right self-start leading-none">
        <Price price={item.total || 0} currencyCode={cart.currency_code} className="w-fit leading-none" priceClassName="text-[16px]" textColor="text-black" />
      </div>
    </div>
  )
}

export const CartLineItem = ({
  item,
  cart,
  type = "default",
  fields,
  className,
  onClose,
  countryCode = "us",
}: CartLineItemProps) => {
  if (type === "compact") {
    return <CompactCartLineItem item={item} cart={cart} fields={fields} className={className} onClose={onClose} countryCode={countryCode} />
  }

  if (type === "display") {
    return <DisplayCartLineItem item={item} cart={cart} className={className} />
  }

  return (
    <div className="flex items-center gap-6 py-4 border-b border-[var(--color-grounded-light-gray)]">
      <div className="flex-shrink-0">
        <Thumbnail thumbnail={item.thumbnail} alt={item.product_title || item.title} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-y-1">
        <span className="text-[var(--color-grounded-text)] text-[13px] font-medium">{item.product_title}</span>
        {item.variant_title && item.variant_title !== "Default Variant" && (
          <span className="text-[var(--color-grounded-gray)] text-[11px]">{item.variant_title}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <CartItemQuantitySelector item={item} fields={fields} />

        <div className="text-right">
          <LineItemPrice item={item} currencyCode={cart.currency_code} />
        </div>

        <CartDeleteItem item={item} fields={fields} />
      </div>
    </div>
  )
}


interface CartSummaryProps {
  cart: HttpTypes.StoreCart
}

export const CartSummary = ({ cart }: CartSummaryProps) => {
  const removePromoCode = useRemovePromoCode()
  
  if ("isOptimistic" in cart && cart.isOptimistic) {
    return <Loading />
  }
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between text-[16px] text-black">
          <span>Subtotal</span>
          <Price
            price={cart.subtotal}
            currencyCode={cart.currency_code}
            priceClassName="text-[16px]"
            textColor="text-black"
          />
        </div>

        <div className="flex justify-between text-base">
          <span className="text-black">Shipping</span>
          <Price
            price={cart.shipping_total}
            currencyCode={cart.currency_code}
            className="text-[var(--color-grounded-text)]"
            priceClassName="text-base text-black"
          />
        </div>

        {cart.discount_total > 0 && (
          <div className="flex justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <span className="text-base text-black">Discount</span>
              {cart.promotions?.map((promotion) => (
                <button
                  key={promotion.code}
                  onClick={() => removePromoCode.mutate({ code: promotion.code! })}
                  className="inline-flex items-center px-[5px] h-[18px] bg-blue-100 text-[12px] font-normal tracking-[0.04em] text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                >
                  {promotion.code}
                </button>
              ))}
            </div>
            <Price
              price={cart.discount_total}
              currencyCode={cart.currency_code}
              type="discount"
              textColor="#1d4ed8"
            />
          </div>
        )}

      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[20px] font-medium">
          <span className="text-black">Total</span>
          <Price price={cart.total} currencyCode={cart.currency_code} priceClassName="!text-[20px] !text-black !opacity-100" />
        </div>
        <div className="flex justify-between text-sm text-black/60">
          <span>
            Including <Price price={cart.tax_total} currencyCode={cart.currency_code} className="inline" priceClassName="!text-sm !text-black/60 !opacity-100" /> in taxes
          </span>
          <span>{cart.currency_code?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}


type CartPromoProps = {
  cart: HttpTypes.StoreCart
}

export const CartPromo = (_props: CartPromoProps) => {
  const [promoCode, setPromoCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const applyPromoCodeMutation = useApplyPromoCode()

  const handleApply = () => {
    setError(null)
    applyPromoCodeMutation.mutate(
      { code: promoCode },
      {
        onSuccess: () => {
          setPromoCode("")
          setError(null)
        },
        onError: () => {
          setError("Invalid discount code")
        },
      }
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="relative w-full">
          <Input
            className="w-full pr-16"
            placeholder="Discount code"
            name="promoCode"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApply()
              }
            }}
          />
          <button 
            onClick={handleApply} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-black underline"
          >
            Apply
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  )
}


export const CartEmpty = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  return (
    <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
      <h2 className="text-[16px] font-medium text-[var(--color-grounded-text)]">Your cart is empty.</h2>
      <p className="text-[var(--color-grounded-gray)] text-[13px]">Start by adding some products</p>
      <Link to="/$countryCode/store" params={{ countryCode }}>
        <button className="btn-grounded">
          Continue shopping
        </button>
      </Link>
    </div>
  )
}


// Payment method icons component
const PaymentIcons = () => {
  const paymentLogos = [
    { name: "Apple Pay", url: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/apple-01KFNQ3ZQT62M2ZB944XX0F5V1.svg" },
    { name: "Mastercard", url: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/master-01KFNQ4084VTRGK25RD6S6Y6X4.svg" },
    { name: "PayPal", url: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/paypal-01KFNQ40NS0CPT2DQTQWYZDBQ5.svg" },
    { name: "Visa", url: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/visa-01KFNQ4120ZSB0V2VDQQ9EJCWS.svg" },
  ]

  return (
    <div className="flex items-center justify-center gap-4 pb-4">
      {paymentLogos.map((logo) => (
        <img
          key={logo.name}
          src={logo.url}
          alt={logo.name}
          className="h-12 w-auto"
        />
      ))}
    </div>
  )
}


// Recommended product card for cart drawer
interface RecommendedProductCardProps {
  product: HttpTypes.StoreProduct
  currencyCode: string
  countryCode: string
  onAddToCart: (variantId: string) => void
  isAdding?: boolean
  onClose?: () => void
}

const RecommendedProductCard = ({ product, currencyCode, countryCode, onAddToCart, isAdding, onClose }: RecommendedProductCardProps) => {
  const firstVariant = product.variants?.[0]
  const variantWithPrice = firstVariant as (typeof firstVariant & { calculated_price?: { calculated_amount?: number }, images?: { url: string }[] }) | undefined
  const price = variantWithPrice?.calculated_price?.calculated_amount || 0
  const variantTitle = firstVariant?.title && firstVariant.title !== "Default Variant"
    ? firstVariant.title
    : null

  // Get thumbnail from first variant's images
  const variantImages = variantWithPrice?.images
  const thumbnail = variantImages?.[0]?.url || product.thumbnail

  return (
    <Link 
      to="/$countryCode/products/$handle"
      params={{ countryCode, handle: product.handle || "" }}
      className="flex-shrink-0 w-[360px] h-[112px] bg-black/5 cursor-pointer overflow-hidden flex"
      onClick={onClose}
    >
      <div className="relative w-[96px] h-[96px] flex-shrink-0 bg-gradient-to-br from-neutral-50 to-neutral-100 mt-2 ml-2 mb-2 overflow-hidden">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt={product.title || ""} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ border: "0.5px solid rgba(0, 0, 0, 0.08)" }} />
      </div>
      <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0 relative">
        <div>
          <h4 className="text-[16px] font-medium text-[var(--color-grounded-text)] truncate pr-12">
            {product.title}
          </h4>
          <div className="text-[14px] font-medium mt-0.5">
            <Price price={price} currencyCode={currencyCode} textSize="small" className="!text-neutral-600" />
          </div>
        </div>
        {variantTitle && (
          <p className="text-[14px] text-neutral-600 truncate">{variantTitle}</p>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (firstVariant) {
              onAddToCart(firstVariant.id)
            }
          }}
          disabled={isAdding || !firstVariant}
          className="absolute top-2 right-2 px-3 py-1 text-[16px] font-medium bg-black/5 text-[var(--color-grounded-text)] hover:bg-black/10 transition-colors disabled:opacity-50 rounded-none cursor-pointer"
        >
          {isAdding ? "..." : "Add"}
        </button>
      </div>
    </Link>
  )
}


// Cart recommendations section
interface CartRecommendationsProps {
  currencyCode: string
  regionId?: string
  countryCode: string
  onClose?: () => void
}

const CartRecommendations = ({ currencyCode, regionId, countryCode, onClose }: CartRecommendationsProps) => {
  const { data: productsData, isLoading } = useLatestProducts({ limit: 6, region_id: regionId })
  const addToCartMutation = useAddToCart()
  const [addingProductId, setAddingProductId] = useState<string | null>(null)

  const handleAddToCart = (variantId: string, productId: string) => {
    setAddingProductId(productId)
    addToCartMutation.mutate(
      { variant_id: variantId, quantity: 1, country_code: countryCode },
      {
        onSettled: () => setAddingProductId(null),
      }
    )
  }

  if (isLoading || !productsData?.products?.length) {
    return null
  }

  return (
    <div className="pt-4 mt-auto shrink-0 bg-white">
      <h3 className="text-[20px] font-medium text-[var(--color-grounded-text)] pl-4 pr-6">
        You may also like
      </h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar border-l-[16px] border-r-[16px] border-transparent py-4">
        {productsData.products.map((product) => (
          <RecommendedProductCard
            key={product.id}
            product={product}
            currencyCode={currencyCode}
            countryCode={countryCode}
            onAddToCart={(variantId) => handleAddToCart(variantId, product.id)}
            isAdding={addingProductId === product.id}
            onClose={onClose}
          />
        ))}
      </div>
      <PaymentIcons />
    </div>
  )
}


export const DEFAULT_CART_DROPDOWN_FIELDS = "id, *items, total, currency_code, item_subtotal"

interface CartDropdownProps {
  variant?: "dark" | "light"
}

export const CartDropdown = ({ variant = "dark" }: CartDropdownProps) => {
  const { isOpen, openCart, closeCart } = useCartDrawer()
  const { data: cart } = useCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  // Get region for recommendations
  const { data: region } = useRegion({ country_code: countryCode || "us" })

  const sortedItems = sortCartItems(cart?.items || [])
  const itemCount = sortedItems?.reduce((total, item) => total + item.quantity, 0) || 0

  // Format count with leading zero (01, 02, etc.)
  const formattedCount = itemCount.toString().padStart(2, "0")

  // Get estimated shipping date (tomorrow)
  const getEstimatedShippingDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false)

  const buttonStyles = variant === "dark"
    ? "bg-black/0 hover:bg-white/10 text-white"
    : "bg-transparent hover:bg-neutral-100 text-neutral-800"

  return (
    <Drawer open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <DrawerTrigger asChild>
        <button className={`h-[28px] px-3 rounded-none transition-colors flex items-center justify-center tracking-wide capitalize text-[16px] font-normal ${buttonStyles}`}>
          <span className="flex items-baseline gap-1">
            <span>Cart</span>
            <span className="text-[11px] opacity-70 relative -top-[3px]">{formattedCount}</span>
          </span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        {/* Header */}
        <DrawerHeader className={`flex items-start justify-between !p-2 !h-auto !border-0 ${itemCount > 0 ? "border-b !border-b border-[var(--color-grounded-light-gray)]" : ""}`}>
          <div className="text-left p-2">
            <DrawerTitle className="text-[20px] font-medium leading-none text-[var(--color-grounded-text)]">
              Your cart
            </DrawerTitle>
{itemCount > 0 && (
              <p className="text-[20px] font-medium leading-none text-[var(--color-grounded-gray)]">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          <button 
            onClick={closeCart}
            className="w-[80px] h-[80px] flex flex-col justify-between items-start p-2 bg-black/5 hover:bg-black/10 rounded-none transition-colors self-start cursor-pointer"
          >
            <span className="text-[16px] text-black font-medium leading-none">Close</span>
            <XMark className="w-4 h-4 text-neutral-600" />
          </button>
        </DrawerHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Empty Cart State */}
          {(!cart || itemCount === 0) && (
            <div className="flex-1 flex flex-col items-start justify-center pl-4">
              <h3 className="text-[20px] font-medium text-[var(--color-grounded-text)] leading-[100%]">
                Your cart is empty.
              </h3>
              <p className="text-[20px] text-[var(--color-grounded-gray)]">
                Add your favorites.
              </p>
            </div>
          )}

          {/* Cart Items */}
          {cart && itemCount > 0 && (
            <div>
              {sortedItems?.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  cart={cart}
                  type="compact"
                  fields={DEFAULT_CART_DROPDOWN_FIELDS}
                  onClose={closeCart}
                  countryCode={countryCode}
                />
              ))}
            </div>
          )}

          {/* You may also like section - inside scroll area on mobile */}
          <div className="md:hidden">
            <CartRecommendations 
              currencyCode={cart?.currency_code || "usd"} 
              regionId={region?.id}
              countryCode={countryCode || "us"}
              onClose={closeCart}
            />
          </div>

        </div>

        {/* You may also like section with Payment Icons - anchored to bottom on desktop */}
        <div className="hidden md:block">
          <CartRecommendations 
            currencyCode={cart?.currency_code || "usd"} 
            regionId={region?.id}
            countryCode={countryCode || "us"}
            onClose={closeCart}
          />
        </div>

        {/* Footer - only show when cart has items */}
        {sortedItems.length > 0 && (
          <DrawerFooter className="border-t border-[var(--color-grounded-light-gray)] bg-black/5 !p-4 space-y-4">
            {/* Shipping estimate */}
            <div className="flex items-center justify-between text-base">
              <span className="text-neutral-600">Shipping</span>
              <span className="text-[var(--color-grounded-text)]">{getEstimatedShippingDate()}</span>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 appearance-none border border-neutral-400 bg-transparent checked:border-neutral-400 cursor-pointer relative checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-[7px] checked:after:h-[7px] checked:after:bg-black checked:after:content-['']"
                style={{ borderRadius: 0, width: "15px", height: "15px", minWidth: "15px", minHeight: "15px" }}
              />
              <span className="text-sm text-black">
                I accept the{" "}
                <a href="#" className="underline hover:text-[var(--color-grounded-text)]">
                  terms and conditions
                </a>
              </span>
            </label>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {termsAccepted ? (
                <Link to="/$countryCode/checkout" params={{ countryCode }} search={{ step: "addresses" }} onClick={closeCart} className="flex-1">
                  <button className="w-full h-[48px] px-6 bg-black hover:bg-gray-800 text-white text-[20px] font-medium rounded-none transition-colors flex items-center justify-center gap-2">
                    <span>Go to checkout</span>
                    <span>
                      <Price price={cart?.total || 0} currencyCode={cart?.currency_code || "usd"} textSize="small" className="text-white/80" priceClassName="text-white/70 text-[20px]" />
                    </span>
                  </button>
                </Link>
              ) : (
                <button 
                  disabled
                  className="flex-1 w-full h-[48px] px-6 bg-neutral-300 text-neutral-500 text-[20px] font-medium rounded-none cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Go to checkout</span>
                  <span>
                    <Price price={cart?.total || 0} currencyCode={cart?.currency_code || "usd"} textSize="small" className="text-neutral-400" priceClassName="text-neutral-400 text-[20px]" />
                  </span>
                </button>
              )}
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// Default export for backwards compatibility
export default CartLineItem
