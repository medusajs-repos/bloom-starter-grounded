import { useContext, createContext } from "react"

type CartContextType = {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCartDrawer = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCartDrawer must be used within CartProvider")
  }
  return context
}
