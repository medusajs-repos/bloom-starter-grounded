import { CartLineItem, CartSummary, CartPromo } from "@/components/cart"
import { Loading } from "@/components/ui/loading"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"

interface CheckoutSummaryProps {
  cart: HttpTypes.StoreCart;
}

const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<Loading />}>
        <div className="max-h-[280px] overflow-y-auto no-scrollbar md:[scrollbar-width:auto] md:[&::-webkit-scrollbar]:block">
          {cart.items?.map((item) => (
            <CartLineItem key={item.id} item={item} cart={cart} type="display" />
          ))}
        </div>
      </Suspense>

      <Suspense fallback={<Loading />}>
        <div className="mt-8">
          <CartPromo cart={cart} />
        </div>
      </Suspense>

      <Suspense fallback={<Loading />}>
        <div className="mt-8">
          <CartSummary cart={cart} />
        </div>
      </Suspense>
    </div>
  )
}

export default CheckoutSummary
