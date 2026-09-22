import { indexedCurrency, priceAttribute } from "@/lib/search-client"

const amount = (value: unknown) => (typeof value === "number" ? value : null)

/**
 * The price fields are per currency, e.g. `min_price_eur`, so they're read
 * through `priceAttribute` rather than declared on the hit type.
 */
export const hitPricing = (
  hit: Record<string, unknown>,
  currencyCode: string
) => {
  const min_price = amount(hit[priceAttribute("min_price", currencyCode)])
  const original_price = amount(
    hit[priceAttribute("original_price", currencyCode)]
  )
  const on_sale =
    hit[priceAttribute("on_sale", currencyCode)] === true &&
    original_price !== null &&
    min_price !== null &&
    original_price > min_price

  return {
    currency_code: indexedCurrency(currencyCode),
    min_price,
    max_price: amount(hit[priceAttribute("max_price", currencyCode)]),
    original_price,
    on_sale,
  }
}
