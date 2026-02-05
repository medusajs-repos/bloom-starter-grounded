import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type NavbarVariant = "transparent" | "solid"

interface NavbarContextType {
  variant: NavbarVariant
  setVariant: (variant: NavbarVariant) => void
  isScrolled: boolean
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<NavbarVariant>("solid")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Consider scrolled after passing the hero section (roughly 100px)
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <NavbarContext.Provider value={{ variant, setVariant, isScrolled }}>
      {children}
    </NavbarContext.Provider>
  )
}

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
