import { sdk } from "@/lib/utils/sdk"
import { HttpTypes } from "@medusajs/types"

/**
 * Global product options (introduced in Medusa core PR #13817) live behind
 * `/store/product-options`. Passing `is_exclusive=false` filters out the legacy
 * per-product (exclusive) options and returns only globally-shared options.
 */
export type StoreProductOption = HttpTypes.StoreProductOption & {
  is_exclusive?: boolean
}

export const listGlobalProductOptions = async (): Promise<
  StoreProductOption[]
> => {
  const response = await sdk.client.fetch<{
    product_options: StoreProductOption[]
  }>("/store/product-options", {
    method: "GET",
    query: {
      is_exclusive: false,
      fields: "*values",
      limit: 100,
    },
  })

  return response.product_options || []
}
