import { CartEmpty } from "@/components/cart"
import CheckoutSummary from "@/components/checkout-summary"
import AddressForm from "@/components/address-form"
import ShippingItemSelector from "@/components/shipping-item-selector"
import PaymentContainer from "@/components/payment-container"
import StripeCardContainer from "@/components/stripe-card-container"
import PaymentButton from "@/components/payment-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import Radio from "@/components/ui/radio"
import { Loading } from "@/components/ui/loading"
import { useCart } from "@/lib/hooks/use-cart"
import { Link, useParams } from "@tanstack/react-router"
import {
  useSetCartAddresses,
  useSetCartShippingMethod,
  useShippingOptions,
  useCartPaymentMethods,
  useInitiateCartPaymentSession,
} from "@/lib/hooks/use-checkout"
import { getStoredCountryCode } from "@/lib/utils/region"
import {
  isStripe as isStripeFunc,
  getActivePaymentSession,
  isPaidWithGiftCard,
} from "@/lib/utils/checkout"
import { useCallback, useEffect, useState } from "react"

const Checkout = () => {
  const { data: cart, isLoading: cartLoading } = useCart()
  const storedCountryCode = getStoredCountryCode()

  // Address state
  const setAddressesMutation = useSetCartAddresses()
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [email, setEmail] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [shippingAddress, setShippingAddress] = useState<Record<string, any>>({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    country_code: storedCountryCode || "",
    phone: "",
  })
  const [billingAddress, setBillingAddress] = useState<Record<string, any>>({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    country_code: storedCountryCode || "",
    phone: "",
  })
  const [isShippingAddressValid, setIsShippingAddressValid] = useState(false)
  const [isBillingAddressValid, setIsBillingAddressValid] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)

  // Delivery state
  const { data: shippingOptions } = useShippingOptions({
    cart_id: cart?.id || "",
  })
  const setShippingMethodMutation = useSetCartShippingMethod()
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>("")

  // Payment state
  const { data: availablePaymentMethods = [] } = useCartPaymentMethods({
    region_id: cart?.region?.id,
  })
  const initiatePaymentSessionMutation = useInitiateCartPaymentSession()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const paidByGiftcard = cart ? isPaidWithGiftCard(cart) : false

  // Initialize state from cart
  useEffect(() => {
    if (cart) {
      setEmail(cart.email || "")
      if (cart.shipping_address) {
        setShippingAddress({
          first_name: cart.shipping_address.first_name || "",
          last_name: cart.shipping_address.last_name || "",
          company: cart.shipping_address.company || "",
          address_1: cart.shipping_address.address_1 || "",
          address_2: cart.shipping_address.address_2 || "",
          city: cart.shipping_address.city || "",
          postal_code: cart.shipping_address.postal_code || "",
          province: cart.shipping_address.province || "",
          country_code: cart.shipping_address.country_code || storedCountryCode || "",
          phone: cart.shipping_address.phone || "",
        })
        setAddressSaved(true)
      }
      if (cart.billing_address) {
        setBillingAddress({
          first_name: cart.billing_address.first_name || "",
          last_name: cart.billing_address.last_name || "",
          company: cart.billing_address.company || "",
          address_1: cart.billing_address.address_1 || "",
          address_2: cart.billing_address.address_2 || "",
          city: cart.billing_address.city || "",
          postal_code: cart.billing_address.postal_code || "",
          province: cart.billing_address.province || "",
          country_code: cart.billing_address.country_code || storedCountryCode || "",
          phone: cart.billing_address.phone || "",
        })
      }
      if (cart.shipping_methods?.[0]?.shipping_option_id) {
        setSelectedShippingOption(cart.shipping_methods[0].shipping_option_id)
      }
    }
  }, [cart, storedCountryCode])

  // Auto-select first shipping option
  useEffect(() => {
    if (!selectedShippingOption && shippingOptions && shippingOptions.length > 0) {
      setSelectedShippingOption(shippingOptions[0].id)
    }
  }, [shippingOptions, selectedShippingOption])

  // Auto-select first payment method
  useEffect(() => {
    if (!selectedPaymentMethod && availablePaymentMethods?.length > 0) {
      const firstMethod = availablePaymentMethods[0].id
      setSelectedPaymentMethod(firstMethod)
      initiatePaymentSession(firstMethod)
    }
  }, [availablePaymentMethods, selectedPaymentMethod])

  const initiatePaymentSession = useCallback(
    async (method: string) => {
      initiatePaymentSessionMutation.mutate(
        { provider_id: method },
        {
          onError: (error) => {
            setPaymentError(
              error instanceof Error ? error.message : "An error occurred"
            )
          },
        }
      )
    },
    [initiatePaymentSessionMutation]
  )

  const handlePaymentMethodChange = (method: string) => {
    setPaymentError(null)
    setSelectedPaymentMethod(method)
    initiatePaymentSession(method)
  }

  const handleShippingOptionChange = async (optionId: string) => {
    setSelectedShippingOption(optionId)
    if (addressSaved) {
      await setShippingMethodMutation.mutateAsync({ shipping_option_id: optionId })
    }
  }

  const isEmailValid = email.trim() && email.includes("@")
  const isAddressFormValid =
    isEmailValid && isShippingAddressValid && (isBillingAddressValid || sameAsBilling)

  // Save address and shipping on blur/change
  const handleSaveAddress = async () => {
    if (!isAddressFormValid) return

    const submitData = new FormData()
    submitData.append("email", email)

    Object.entries(shippingAddress).forEach(([key, value]) => {
      submitData.append(`shipping_address.${key}`, value)
    })

    const billingData = sameAsBilling ? shippingAddress : billingAddress
    Object.entries(billingData).forEach(([key, value]) => {
      submitData.append(`billing_address.${key}`, value)
    })

    await setAddressesMutation.mutateAsync(submitData)
    setAddressSaved(true)

    // Also set shipping method if selected
    if (selectedShippingOption) {
      await setShippingMethodMutation.mutateAsync({
        shipping_option_id: selectedShippingOption,
      })
    }
  }

  // Auto-save when form becomes valid
  useEffect(() => {
    if (isAddressFormValid && !addressSaved && !setAddressesMutation.isPending) {
      handleSaveAddress()
    }
  }, [isAddressFormValid, addressSaved])

  if (cartLoading) {
    return (
      <div className="w-full max-w-[1024px] mx-auto px-6 py-12 md:py-16">
        <Loading />
      </div>
    )
  }

  if (!cart || !cart.items?.length) {
    return (
      <div className="w-full max-w-[1024px] mx-auto px-6 py-12 md:py-16">
        <CartEmpty />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Checkout Header */}
      <header className="w-full py-6">
        <div className="w-full max-w-[1024px] mx-auto px-6">
          <div className="flex items-center justify-between">
            <a href={`/${storedCountryCode || "us"}`}>
              <img 
                src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/grounded-01KFGR18H0QZZ1KXWENJQS4MMS.svg" 
                alt="Grounded" 
                className="h-5 w-auto invert"
              />
            </a>
            <a 
              href={`/${storedCountryCode || "us"}`}
              className="flex items-center gap-2 text-base text-neutral-600 hover:text-black transition-colors"
            >
              Homepage
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="flex items-center justify-center">
                <path d="M5.5 3.5L10.5 7.5L5.5 11.5V3.5Z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1024px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column - Checkout Form */}
        <div className="flex flex-col gap-10 pt-8 pb-32 order-2 lg:order-1">
          {/* Contact Section */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[20px] font-medium text-black">Contact</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="block text-sm font-medium text-black">
                    Email
                  </label>
                  <button type="button" className="text-sm text-black underline hover:opacity-60 transition-opacity">
                    Log in
                  </button>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setAddressSaved(false)
                  }}
                  placeholder="your@email.com"
                  
                />
              </div>
              <label 
                className="flex items-start gap-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setTermsAccepted(!termsAccepted);
                }}
              >
                <div 
                  className="mt-0.5 flex items-center justify-center cursor-pointer shrink-0"
                  style={{ width: '15px', height: '15px', border: '1px solid black' }}
                >
                  {termsAccepted && <div style={{ width: '7px', height: '7px', backgroundColor: 'black' }} />}
                </div>
                <span className="text-sm text-black">
                  If you do not wish to receive marketing or news about similar products from Grounded via email, you can opt out by removing the checkmark in the box.
                </span>
              </label>
            </div>
          </section>

          {/* Shipping Address Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[20px] font-medium text-black">Shipping</h2>

            <div className="space-y-4">

              <AddressForm
                addressFormData={shippingAddress}
                setAddressFormData={(data) => {
                  setShippingAddress(data)
                  setAddressSaved(false)
                }}
                countries={cart.region?.countries}
                setIsFormValid={setIsShippingAddressValid}
              />

              <label 
                className="flex items-center gap-2 pt-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setSameAsBilling(!sameAsBilling);
                }}
              >
                <div 
                  className="flex items-center justify-center cursor-pointer shrink-0"
                  style={{ width: '15px', height: '15px', border: '1px solid black' }}
                >
                  {sameAsBilling && <div style={{ width: '7px', height: '7px', backgroundColor: 'black' }} />}
                </div>
                <span className="text-sm text-black">
                  Billing address same as shipping
                </span>
              </label>

              {!sameAsBilling && (
                <div className="pt-4 space-y-4">
                  <h2 className="text-[20px] font-medium text-black">Billing Address</h2>
                  <AddressForm
                    addressFormData={billingAddress}
                    setAddressFormData={(data) => {
                      setBillingAddress(data)
                      setAddressSaved(false)
                    }}
                    countries={cart.region?.countries}
                    setIsFormValid={setIsBillingAddressValid}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Delivery Options */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[20px] font-medium text-black">Delivery</h2>

            <div className="space-y-2">
              {shippingOptions?.map((option) => (
                <ShippingItemSelector
                  key={option.id}
                  shippingOption={option}
                  isSelected={selectedShippingOption === option.id}
                  handleSelect={handleShippingOptionChange}
                  cart={cart}
                />
              ))}

              {!shippingOptions?.length && (
                <p className="text-sm text-neutral-500">
                  Enter your address to see delivery options.
                </p>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-neutral-900">Payment</h2>

            {!paidByGiftcard && (
              <div className="space-y-2">
                {/* Credit card (first and selected by default) */}
                {availablePaymentMethods?.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    <PaymentContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      onClick={() => handlePaymentMethodChange(paymentMethod.id)}
                    >
                      {(isStripeFunc(paymentMethod.id) || paymentMethod.id === "pp_system_default") && (
                        <StripeCardContainer
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          setError={setPaymentError}
                          onSelect={() => handlePaymentMethodChange(paymentMethod.id)}
                          onCardComplete={() => {}}
                        />
                      )}
                    </PaymentContainer>
                  </div>
                ))}

                {/* Apple Pay */}
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 border transition-colors bg-neutral-50 border-neutral-200 ${
                    selectedPaymentMethod === "pp_apple_pay"
                      ? "border-neutral-900"
                      : "hover:border-neutral-300"
                  }`}
                  onClick={() => handlePaymentMethodChange("pp_apple_pay")}
                >
                  <div className={`flex items-center ${selectedPaymentMethod === "pp_apple_pay" ? "gap-x-2" : ""}`}>
                    <Radio checked={selectedPaymentMethod === "pp_apple_pay"} readOnly />
                    <p className="text-base font-medium">Apple Pay</p>
                  </div>
                  <div className="h-4 overflow-visible flex items-center">
                    <img src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/apple-01KFNQ3ZQT62M2ZB944XX0F5V1.svg" alt="Apple Pay" className="h-12" />
                  </div>
                </div>

                {/* PayPal */}
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 border hover:border-neutral-300 transition-colors bg-neutral-50 ${
                    selectedPaymentMethod === "pp_paypal"
                      ? "border-neutral-900"
                      : "border-neutral-200"
                  }`}
                  onClick={() => handlePaymentMethodChange("pp_paypal")}
                >
                  <div className={`flex items-center ${selectedPaymentMethod === "pp_paypal" ? "gap-x-2" : ""}`}>
                    <Radio checked={selectedPaymentMethod === "pp_paypal"} readOnly />
                    <p className="text-base font-medium">PayPal</p>
                  </div>
                  <div className="h-4 overflow-visible flex items-center">
                    <img src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/paypal-01KFNQ40NS0CPT2DQTQWYZDBQ5.svg" alt="PayPal" className="h-12" />
                  </div>
                </div>

                {/* Redirect message for Apple Pay and PayPal */}
                {(selectedPaymentMethod === "pp_apple_pay" || selectedPaymentMethod === "pp_paypal") && (
                  <p className="text-sm text-neutral-600 mt-2">
                    After clicking "Pay Now", you will be redirected to a new page to complete your purchase securely.
                  </p>
                )}

              </div>
            )}

            {paidByGiftcard && (
              <div className="p-4 border border-neutral-200 bg-neutral-50">
                <p className="text-sm text-neutral-600">
                  Your order will be paid with a gift card.
                </p>
              </div>
            )}

            {paymentError && (
              <div className="p-2 border border-rose-200 bg-rose-50 text-rose-900 text-sm">
                The selected payment option is not configured properly in the backend yet.
              </div>
            )}
          </section>

          {/* Place Order Button */}
          <div>
            <PaymentButton cart={cart} className="w-full" />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="pt-8 order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <section className="flex flex-col gap-6">
              <h2 className="text-[20px] font-medium text-black">Order Summary</h2>
              <CheckoutSummary cart={cart} />
            </section>
          </div>
        </div>
      </div>
      </div>

      {/* Footer Policy Links */}
      <footer className="w-full py-6">
        <div className="max-w-[1024px] mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <a href="/refund-policy" className="text-neutral-600 text-sm underline decoration-neutral-600 hover:text-black hover:decoration-black transition-colors">Refund Policy</a>
            <a href="/shipping" className="text-neutral-600 text-sm underline decoration-neutral-600 hover:text-black hover:decoration-black transition-colors">Shipping</a>
            <a href="/privacy-policy" className="text-neutral-600 text-sm underline decoration-neutral-600 hover:text-black hover:decoration-black transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="text-neutral-600 text-sm underline decoration-neutral-600 hover:text-black hover:decoration-black transition-colors">Terms of Service</a>
            <a href="/contact" className="text-neutral-600 text-sm underline decoration-neutral-600 hover:text-black hover:decoration-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Checkout
