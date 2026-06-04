import { useQuery } from "@tanstack/react-query"
import { listGlobalProductOptions } from "@/lib/data/product-options"

export const useGlobalProductOptions = () => {
  return useQuery({
    queryKey: ["product-options", "global"],
    queryFn: () => listGlobalProductOptions(),
  })
}
