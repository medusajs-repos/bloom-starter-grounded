import { CartDropdown } from "@/components/cart"
import { XMark } from "@medusajs/icons"
import { MegaMenu } from "@/components/mega-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useNavbar } from "@/lib/hooks/use-navbar"
import { useCategories } from "@/lib/hooks/use-categories"
import { useProductCount } from "@/lib/hooks/use-products"
import { useRegion } from "@/lib/hooks/use-regions"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation } from "@tanstack/react-router"
import { useState, useEffect } from "react"

// Grounded Logo
const GroundedLogo = ({ variant = "light" }: { variant?: "light" | "dark" }) => (
  <>
    {/* Small icon logo for mobile */}
    <img 
      src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/grounded-icon-01KFNFGB26BYY04YBRFPXZ0QWV.svg" 
      alt="Grounded" 
      className={`md:hidden h-6 w-auto transition-all duration-300 ${variant === "dark" ? "invert" : ""}`}
    />
    {/* Full logo for desktop */}
    <img 
      src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/grounded-01KFGR18H0QZZ1KXWENJQS4MMS.svg" 
      alt="Grounded" 
      className={`hidden md:block h-5 w-auto transition-all duration-300 ${variant === "dark" ? "invert" : ""}`}
    />
  </>
)

// Icon components
const SearchIcon = () => (
  <div className="w-7 h-7 flex items-center justify-center">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13.5 13.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
)



const UserIcon = () => (
  <div className="w-7 h-7 flex items-center justify-center">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="4" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14C2 11 4.5 9 7.5 9C10.5 9 13 11 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
)

export const Navbar = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const baseHref = countryCode ? `/${countryCode}` : ""
  const { variant, isScrolled } = useNavbar()
  
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar when at top or scrolling up
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        setIsVisible(true)
      } else {
        // Hide when scrolling down
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const { data: topLevelCategories } = useCategories({
    fields: "id,name,handle,parent_category_id",
    queryParams: { parent_category_id: "null" },
  })

  const { data: region } = useRegion({ country_code: countryCode || "us" })
  const { data: productCount } = useProductCount({ region_id: region?.id })

  const categoryLinks = [
    { id: "shop-all", name: "All Products", to: `${baseHref}/store` },
    ...(topLevelCategories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      to: `${baseHref}/categories/${cat.handle}`,
    })) ?? []),
  ]

  // Determine if we should use solid style (either solid variant or scrolled on transparent)
  const useSolidStyle = variant === "solid" || isScrolled

  return (
    <div className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <header className={`relative h-12 mx-auto transition-colors duration-300 ${useSolidStyle ? "bg-white" : "bg-transparent"}`}>
        <nav className={`text-[13px] flex items-center justify-between w-full h-full px-4 lg:px-8 transition-colors duration-300 ${useSolidStyle ? "border-b border-neutral-200" : "border-b border-white/10"}`}>
          {/* Left - Logo */}
          <div className="flex items-center h-full">
            <Link
              to={baseHref || "/"}
              className="flex items-center"
            >
              <GroundedLogo variant={useSolidStyle ? "dark" : "light"} />
            </Link>
          </div>

          {/* Center - Navigation (Desktop) */}
          <div className="hidden lg:flex items-center h-full absolute left-1/2 transform -translate-x-1/2">
            <MegaMenu baseHref={baseHref} variant={useSolidStyle ? "solid" : "transparent"} productCount={productCount ?? 0} />
          </div>

          {/* Right - Icons */}
          <div className="flex items-center">
            <button className={`hidden lg:flex items-center justify-center w-[28px] h-[28px] rounded-none transition-colors ${useSolidStyle ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-white/10"}`}>
              <SearchIcon />
            </button>
            <button className={`hidden lg:flex items-center justify-center w-[28px] h-[28px] rounded-none transition-colors ${useSolidStyle ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-white/10"}`}>
              <UserIcon />
            </button>
            <CartDropdown variant={useSolidStyle ? "light" : "dark"} />

            {/* Mobile Menu */}
            <Drawer>
              <DrawerTrigger className={`lg:hidden h-[28px] px-3 rounded-none transition-colors flex items-center justify-center tracking-wide capitalize text-[16px] font-normal ${useSolidStyle ? "bg-transparent hover:bg-neutral-100 text-neutral-800" : "bg-black/0 hover:bg-white/10 text-white"}`}>
                Menu
              </DrawerTrigger>
              <DrawerContent side="left" hideClose className="bg-white flex flex-col h-full">
                <DrawerHeader className="flex flex-row items-center justify-between">
                  <DrawerTitle className="uppercase text-[11px] tracking-widest font-medium text-black">Menu</DrawerTitle>
                  <DrawerClose className="w-[15px] h-[15px] flex items-center justify-center">
                    <XMark className="w-[15px] h-[15px] text-neutral-600" />
                  </DrawerClose>
                </DrawerHeader>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {/* Shop Section */}
                  <div className="py-4">
                    <div className="px-6 py-3 text-black text-[11px] uppercase tracking-widest font-medium">
                      Shop
                    </div>
                    <div className="flex flex-col">
                      {categoryLinks.map((link) => (
                        <DrawerClose key={link.id} asChild>
                          <Link
                            to={link.to}
                            className="px-10 py-3 text-black hover:bg-neutral-100 transition-colors text-[16px]"
                          >
                            {link.name}
                          </Link>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>

                  {/* By Style Section */}
                  <div className="py-4 border-t border-neutral-100">
                    <div className="px-6 py-3 text-black text-[11px] uppercase tracking-widest font-medium">
                      By Style
                    </div>
                    <div className="flex flex-col">
                      {["Modern", "Scandinavian", "Mid-Century", "Minimalist"].map((style) => (
                        <DrawerClose key={style} asChild>
                          <a
                            href={`${baseHref}/store`}
                            className="px-10 py-3 text-black hover:bg-neutral-100 transition-colors text-[16px]"
                          >
                            {style}
                          </a>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>

                  {/* Inspiration Section */}
                  <div className="py-4 border-t border-neutral-100">
                    <div className="px-6 py-3 text-black text-[11px] uppercase tracking-widest font-medium">
                      Inspiration
                    </div>
                    <div className="flex flex-col">
                      {["Living Room", "Bedroom", "Dining Room", "Home Office"].map((room) => (
                        <DrawerClose key={room} asChild>
                          <a
                            href={`${baseHref}/store`}
                            className="px-10 py-3 text-black hover:bg-neutral-100 transition-colors text-[16px]"
                          >
                            {room}
                          </a>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Account & Help */}
                <div className="border-t border-neutral-200 py-4">
                  <div className="flex flex-col">
                    <DrawerClose asChild>
                      <a
                        href={`${baseHref}/account`}
                        className="px-6 py-3 text-black hover:bg-neutral-100 transition-colors text-[16px]"
                      >
                        Account
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <button
                        className="px-6 py-3 text-black hover:bg-neutral-100 transition-colors text-[16px] text-left"
                      >
                        Search
                      </button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </nav>
      </header>
    </div>
  )
}
