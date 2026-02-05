import { useState, useEffect, ReactNode } from "react"
import { NavbarContext } from "@/lib/hooks/use-navbar"

type NavbarVariant = "transparent" | "solid"

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
