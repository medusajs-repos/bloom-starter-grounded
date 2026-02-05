import { useContext, useEffect, createContext } from "react"

type NavbarVariant = "transparent" | "solid"

export interface NavbarContextType {
  variant: NavbarVariant
  setVariant: (variant: NavbarVariant) => void
  isScrolled: boolean
}

export const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const useNavbar = () => {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider")
  }
  return context
}

// Hook to set navbar variant on mount
export const useNavbarVariant = (variant: NavbarVariant) => {
  const { setVariant } = useNavbar()

  useEffect(() => {
    setVariant(variant)
    return () => setVariant("solid") // Reset to solid when unmounting
  }, [variant, setVariant])
}
