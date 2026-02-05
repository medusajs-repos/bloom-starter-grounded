import Address from "@/components/address"
import PaymentButton from "@/components/payment-button"
import PaymentMethodInfo from "@/components/payment-method-info"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/ui/price"
import { getActivePaymentSession, isPaidWithGiftCard } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"

interface ReviewStepProps {
  cart: HttpTypes.StoreCart;
  onBack: () => void;
}

const ReviewStep = ({ cart, onBack }: ReviewStepProps) => {
  const paidByGiftcard = isPaidWithGiftCard(cart);
  const activeSession = getActivePaymentSession(cart);

  return (
    <div className="space-y-6">
      {/* Order details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping Address */}
        {cart.shipping_address && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-900">
              Shipping Address
            </h3>
            <div className="text-sm text-neutral-600">
              <Address address={cart.shipping_address} />
            </div>
          </div>
        )}

        {/* Billing Address */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-900">
            Billing Address
          </h3>
          <div className="text-sm text-neutral-600">
            {cart.billing_address ? (
              <Address address={cart.billing_address} />
            ) : (
              <span>Same as shipping address</span>
            )}
          </div>
        </div>

        {/* Shipping Method */}
        {cart.shipping_methods?.[0] && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-900">
              Shipping Method
            </h3>
            <div className="text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <span>{cart.shipping_methods[0].name}</span>
                <span className="text-neutral-400">-</span>
                <Price
                  price={cart.shipping_methods[0].amount}
                  currencyCode={cart.currency_code}
                  textWeight="plus"
                  className="text-neutral-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-900">
            Payment Method
          </h3>
          <div className="text-sm text-neutral-600">
            {activeSession && (
              <PaymentMethodInfo provider_id={activeSession.provider_id} />
            )}
            {paidByGiftcard && <span>Gift Card</span>}
          </div>
        </div>
      </div>

      <hr className="border-neutral-200" />

      <p className="text-sm text-neutral-500">
        By placing your order, you agree to our terms and conditions. Your payment will be authorized and we'll start processing your order.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>

        <PaymentButton cart={cart} />
      </div>
    </div>
  );
};

export default ReviewStep;
