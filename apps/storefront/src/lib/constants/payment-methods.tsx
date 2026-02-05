import React from "react"
import { Cash, CreditCard } from "@medusajs/icons"

// Payment icon URLs
const paymentIcons = {
  applePay: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/apple-01KFNQ3ZQT62M2ZB944XX0F5V1.svg",
  mastercard: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/master-01KFNQ4084VTRGK25RD6S6Y6X4.svg",
  paypal: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/paypal-01KFNQ40NS0CPT2DQTQWYZDBQ5.svg",
  visa: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/visa-01KFNQ4120ZSB0V2VDQQ9EJCWS.svg",
}

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentMethodsData: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <img src={paymentIcons.visa} alt="Visa" className="h-12" />,
  },
  pp_apple_pay: {
    title: "Apple Pay",
    icon: <img src={paymentIcons.applePay} alt="Apple Pay" className="h-12" />,
  },
  pp_mastercard: {
    title: "Mastercard",
    icon: <img src={paymentIcons.mastercard} alt="Mastercard" className="h-12" />,
  },
  pp_paypal: {
    title: "PayPal",
    icon: <img src={paymentIcons.paypal} alt="PayPal" className="h-12" />,
  },
  pp_system_default: {
    title: "Credit card",
    icon: (
      <div className="flex items-center gap-0 h-4 overflow-visible">
        <img src={paymentIcons.visa} alt="Visa" className="h-12" />
        <img src={paymentIcons.mastercard} alt="Mastercard" className="h-12" />
      </div>
    ),
  },
  // Add more payment providers here
}