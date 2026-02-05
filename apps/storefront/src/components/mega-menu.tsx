import { Link } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { CartDropdown } from "@/components/cart"

interface MegaMenuProps {
  baseHref: string
  variant?: "transparent" | "solid"
  productCount?: number
}

// Grounded Logo (mirrored from navbar, inverted for light background)
const GroundedLogo = () => (
  <img 
    src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/grounded-01KFGR18H0QZZ1KXWENJQS4MMS.svg" 
    alt="Grounded" 
    className="h-5 w-auto invert"
  />
)

// Search Icon (mirrored from navbar)
const SearchIcon = () => (
  <div className="w-7 h-7 flex items-center justify-center">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13.5 13.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
)

// User Icon (mirrored from navbar)
const UserIcon = () => (
  <div className="w-7 h-7 flex items-center justify-center">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="4" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14C2 11 4.5 9 7.5 9C10.5 9 13 11 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
)

// Menu data structure
const menuData = {
  sofas: {
    title: "Sofas",
    sections: [
      {
        title: "Featured",
        links: [
          { label: "New Arrivals", href: "/store" },
          { label: "Best Sellers", href: "/store" },
          { label: "Modular Sofas", href: "/store" },
          { label: "Sectionals", href: "/store" },
        ],
      },
      {
        title: "By Style",
        links: [
          { label: "Modern", href: "/store" },
          { label: "Scandinavian", href: "/store" },
          { label: "Mid-Century", href: "/store" },
          { label: "Minimalist", href: "/store" },
        ],
      },
      {
        title: "By Size",
        links: [
          { label: "2-Seater", href: "/store" },
          { label: "3-Seater", href: "/store" },
          { label: "Corner Sofas", href: "/store" },
          { label: "Compact", href: "/store" },
        ],
      },
    ],
    featuredImage: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJMWXK1SMSJJ7G1QZ4MZF7P-01KFJMWXK13DNGFF4PEPB29MVP.jpeg",
    featuredTitle: "Explore Sofas",
    allLink: "/store",
    allCount: 24,
  },
  chairs: {
    title: "Chairs",
    sections: [
      {
        title: "Featured",
        links: [
          { label: "New Arrivals", href: "/store" },
          { label: "Best Sellers", href: "/store" },
          { label: "Lounge Chairs", href: "/store" },
          { label: "Dining Chairs", href: "/store" },
        ],
      },
      {
        title: "By Type",
        links: [
          { label: "Armchairs", href: "/store" },
          { label: "Accent Chairs", href: "/store" },
          { label: "Office Chairs", href: "/store" },
          { label: "Recliners", href: "/store" },
        ],
      },
      {
        title: "By Material",
        links: [
          { label: "Leather", href: "/store" },
          { label: "Fabric", href: "/store" },
          { label: "Velvet", href: "/store" },
          { label: "Wood", href: "/store" },
        ],
      },
    ],
    featuredImage: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJMXTDE36DBQP66BFRJQA6Q-01KFJMXTDEKXC4NAEEZRWZB9SJ.jpeg",
    featuredTitle: "Explore Chairs",
    allLink: "/store",
    allCount: 18,
  },
  accessories: {
    title: "Accessories",
    sections: [
      {
        title: "Featured",
        links: [
          { label: "New Arrivals", href: "/store" },
          { label: "Best Sellers", href: "/store" },
          { label: "Cushions", href: "/store" },
          { label: "Throws", href: "/store" },
        ],
      },
      {
        title: "Lighting",
        links: [
          { label: "Floor Lamps", href: "/store" },
          { label: "Table Lamps", href: "/store" },
          { label: "Pendant Lights", href: "/store" },
          { label: "Wall Lights", href: "/store" },
        ],
      },
      {
        title: "Decor",
        links: [
          { label: "Vases", href: "/store" },
          { label: "Mirrors", href: "/store" },
          { label: "Art", href: "/store" },
          { label: "Rugs", href: "/store" },
        ],
      },
    ],
    featuredImage: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJMS0PTKYH14DSF65MMCTKQ-01KFJMS0PT30RC7SHDNEYV7X8G.jpeg",
    featuredTitle: "Explore Accessories",
    allLink: "/store",
    allCount: 32,
  },
  inspiration: {
    title: "Inspiration",
    sections: [
      {
        title: "Rooms",
        links: [
          { label: "Living Room", href: "/store" },
          { label: "Bedroom", href: "/store" },
          { label: "Dining Room", href: "/store" },
          { label: "Home Office", href: "/store" },
        ],
      },
      {
        title: "Styles",
        links: [
          { label: "Scandinavian", href: "/store" },
          { label: "Industrial", href: "/store" },
          { label: "Bohemian", href: "/store" },
          { label: "Contemporary", href: "/store" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Design Guide", href: "/store" },
          { label: "Color Palettes", href: "/store" },
          { label: "Space Planning", href: "/store" },
          { label: "Care & Maintenance", href: "/store" },
        ],
      },
    ],
    featuredImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=500&fit=crop",
    featuredTitle: "Get Inspired",
    allLink: "/store",
    allCount: 48,
  },
}

type MenuKey = keyof typeof menuData

// Popular products per category
const popularProductsByCategory: Record<MenuKey, Array<{ id: number; image: string; href: string }>> = {
  sofas: [
    { id: 1, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKST6RRVXNXF5VF90DZSDJ-01KFJKST6RZV1EGTKW1YRCDAVJ.jpeg", href: "/store" },
    { id: 2, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKSTRAFH3SVM74PY2G9A28-01KFJKSTRAEQQ3B4DJNZB41CST.jpeg", href: "/store" },
    { id: 3, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKSVK6BGQEW5F9BWEX8E0T-01KFJKSVK6H323D3QE51TAJDK1.jpeg", href: "/store" },
    { id: 4, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKSW6AK7MHPR3JRPK8M9HQ-01KFJKSW6AZ6Y1BJHFFC4DPH9S.jpeg", href: "/store" },
  ],
  chairs: [
    { id: 1, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKSZRKNXASPWCPZ49FTQM7-01KFJKSZRM4K1FSHCS73AZM8V8.jpeg", href: "/store" },
    { id: 2, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT0T2YEKJEQY5KC1F3KNP-01KFJKT0T35T92NBYYV06827PN.jpeg", href: "/store" },
    { id: 3, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT1FX73NRAKCZAM3C0PYC-01KFJKT1FXAYS9FEDD80RDNJKB.jpeg", href: "/store" },
    { id: 4, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT23XYYMDG01DSG6RCHX6-01KFJKT23XHX4PKPSK1HA1WCMF.jpeg", href: "/store" },
  ],
  accessories: [
    { id: 1, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT5MX1ZB8PGF3SXRC8CMM-01KFJKT5MXCJR0KW848J0XQJHQ.jpeg", href: "/store" },
    { id: 2, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT6CXNPX6R4J3X0TWY147-01KFJKT6CXGGT4MKMYGBEXT27T.jpeg", href: "/store" },
    { id: 3, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT6XTTV53K3XBXMHKHV7A-01KFJKT6XVQK83VSN7X35W3GFP.jpeg", href: "/store" },
    { id: 4, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKT7HK0CGDS79PM8W7G6WX-01KFJKT7HKY06C9TKQ97FAKG03.jpeg", href: "/store" },
  ],
  inspiration: [
    { id: 1, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKTB6BC9MMHSAHC4CMQF05-01KFJKTB6B9K6E54FECRYP1QXF.jpeg", href: "/store" },
    { id: 2, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKTC4AHJB8B7Y6SHSYYS8H-01KFJKTC4ABQRXQM1MRZ8ZMWJX.jpeg", href: "/store" },
    { id: 3, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKTCYT9SX9Y0BQGPJYQBGP-01KFJKTCYTF25KBJ6KHBV98BR6.jpeg", href: "/store" },
    { id: 4, image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFJKTDWF2413H3BEW6WJG10C-01KFJKTDWF90C06V1PH0BXFP9A.jpeg", href: "/store" },
  ],
}

export const MegaMenu = ({ baseHref, variant = "transparent", productCount = 0 }: MegaMenuProps) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(true)

  // Handle mount/unmount with animation
  useEffect(() => {
    if (activeMenu) {
      // Only animate in if the menu wasn't already rendered
      if (!shouldRender) {
        setShouldRender(true)
        setIsClosing(false)
        setIsAnimatingIn(true)
        // Trigger the enter animation after mount
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimatingIn(false)
          })
        })
      }
      // If already rendered, just switch content without animation
    }
  }, [activeMenu, shouldRender])

  // Disable body scroll when menu is open
  useEffect(() => {
    if (activeMenu) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [activeMenu])

  const handleMenuClick = (menu: MenuKey) => {
    if (activeMenu === menu) {
      // Close with animation
      setIsClosing(true)
      setTimeout(() => {
        setActiveMenu(null)
        setShouldRender(false)
        setIsClosing(false)
      }, 280)
    } else {
      // If switching menus while open, no closing animation needed
      setActiveMenu(menu)
    }
  }

  const closeMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setActiveMenu(null)
      setShouldRender(false)
      setIsClosing(false)
    }, 250)
  }

  const menuKeys: MenuKey[] = ["sofas", "chairs", "accessories", "inspiration"]

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-x-2 h-full">
        {menuKeys.map((key) => (
          <button
            key={key}
            onClick={() => handleMenuClick(key)}
            className={`h-[28px] flex items-center tracking-wide capitalize text-[16px] font-normal px-3 rounded-none transition-colors ${
              variant === "solid"
                ? activeMenu === key
                  ? "bg-zinc-100 text-zinc-800"
                  : "text-zinc-800 bg-transparent hover:bg-zinc-100"
                : activeMenu === key
                  ? "bg-white/10 text-white"
                  : "text-white bg-transparent hover:bg-white/10"
            }`}
          >
            {menuData[key].title}
          </button>
        ))}
      </div>

      {/* Full-screen overlay container - rendered via portal to escape navbar z-index */}
      {shouldRender && activeMenu && typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop overlay with blur - covers entire screen */}
          <div
            className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-lg transition-opacity duration-150 ${
              (isClosing || isAnimatingIn) ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeMenu}
          >
            {/* Grain overlay using CSS noise */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "200px 200px"
              }}
            />
          </div>

          {/* Dropdown Panel - sits on top of backdrop */}
          <div
            className={`fixed left-1/2 -translate-x-1/2 z-[101] bg-white shadow-2xl overflow-hidden rounded-none ${
              isClosing 
                ? "opacity-0" 
                : "opacity-100"
            }`}
            style={{ 
              width: (isClosing || isAnimatingIn) ? "100vw" : "calc(100vw - 16px)",
              top: (isClosing || isAnimatingIn) ? "0px" : "8px",
              transition: isClosing 
                ? "width 280ms ease-out, top 280ms ease-out, opacity 280ms ease-out"
                : "width 250ms ease-out, top 250ms ease-out, opacity 250ms ease-out"
            }}
          >
          {/* Mirrored Navbar Header */}
          <div className="h-[48px] px-8 flex items-center justify-between border-b border-neutral-200">
            {/* Left - Logo */}
            <div className="flex items-center h-full">
              <Link
                to={baseHref || "/"}
                className="text-neutral-900 flex items-center"
                onClick={closeMenu}
              >
                <GroundedLogo />
              </Link>
            </div>

            {/* Center - Navigation */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-x-2">
              {menuKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleMenuClick(key)}
                  className={`h-[28px] flex items-center tracking-wide capitalize text-[16px] font-normal px-3 rounded-none transition-colors ${
                    activeMenu === key ? "bg-neutral-900 text-white" : "text-neutral-900 bg-transparent hover:bg-neutral-100"
                  }`}
                >
                  {menuData[key].title}
                </button>
              ))}
            </div>

            {/* Right - Icons */}
            <div className="flex items-center gap-x-2">
              <button className="flex items-center justify-center w-[28px] h-[28px] rounded-none text-neutral-900 hover:bg-neutral-100 transition-colors">
                <SearchIcon />
              </button>
              <button className="flex items-center justify-center w-[28px] h-[28px] rounded-none text-neutral-900 hover:bg-neutral-100 transition-colors">
                <UserIcon />
              </button>
              <CartDropdown variant="light" />
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex h-[560px]">
            {/* Left Content - Links */}
            <div className="flex-1 p-10 flex flex-col justify-between">
              {/* Section Links */}
              <div className="flex gap-x-8">
                {menuData[activeMenu].sections.map((section) => (
                  <div key={section.title} className="min-w-[240px]">
                    <h3 className="text-[14px] uppercase tracking-widest font-medium text-neutral-500 mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={`${baseHref}${link.href}`}
                            className="text-[16px] text-neutral-800 hover:text-neutral-500 transition-colors"
                            onClick={closeMenu}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to={`${baseHref}${menuData[activeMenu].allLink}`}
                          className="text-[16px] text-neutral-800 hover:text-neutral-500 transition-colors inline-flex items-baseline gap-0.5"
                          onClick={closeMenu}
                        >
                          See all
                          <span className="text-[11px] text-neutral-500 relative -top-[3px]">
                            {productCount}
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* Popular Right Now - Anchored to bottom */}
              <div>
                <h3 className="text-[14px] uppercase tracking-widest font-medium text-neutral-500 mb-4">
                  Popular Right Now
                </h3>
                <div className="flex gap-3">
                  {popularProductsByCategory[activeMenu].map((product) => (
                    <Link
                      key={product.id}
                      to={`${baseHref}${product.href}`}
                      className="relative w-16 h-16 bg-neutral-100 rounded-none overflow-hidden hover:opacity-80 transition-opacity"
                      onClick={closeMenu}
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 rounded-none pointer-events-none" style={{ border: "0.5px solid rgba(0, 0, 0, 0.08)" }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Featured Image */}
            <div className="w-[400px] relative p-2">
              <Link
                to={`${baseHref}${menuData[activeMenu].allLink}`}
                className="absolute inset-2 rounded-none overflow-hidden group/featured block"
                onClick={closeMenu}
              >
                <img
                  src={menuData[activeMenu].featuredImage}
                  alt={menuData[activeMenu].featuredTitle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/featured:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Grain overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                  }}
                />
                <div className="absolute inset-0 rounded-none pointer-events-none" style={{ border: "0.5px solid rgba(0, 0, 0, 0.08)" }} />
                <div className="absolute bottom-6 left-6 z-10">
                  <p className="text-white text-xl font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    {menuData[activeMenu].featuredTitle}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom Bar - See All */}
          <div className="bg-white px-2 pb-2">
            <Link
              to={`${baseHref}${menuData[activeMenu].allLink}`}
              className="h-12 bg-black/5 hover:bg-black/10 flex items-center justify-center text-[16px] font-medium text-black transition-colors gap-1 rounded-none"
              onClick={closeMenu}
            >
              See all
              <span className="text-[11px] text-neutral-500 relative -top-[3px]">
                {productCount}
              </span>
            </Link>
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  )
}
