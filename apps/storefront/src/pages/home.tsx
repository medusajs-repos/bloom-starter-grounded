import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HeroSlider } from "@/components/hero-slider"
import { useNavbarVariant } from "@/lib/context/navbar-context"
import { ArrowRight } from "@medusajs/icons"
import { useRef, useEffect, useState } from "react"

const Home = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const storeHref = countryCode ? `/${countryCode}/store` : "/store"

  // Set transparent navbar for hero pages
  useNavbarVariant("transparent")

  return (
    <div className="bg-white space-y-2">
      {/* ========== SECTION 1: HERO ========== */}
      {/* Full viewport video slider at the top of the page */}
      <HeroSlider />

      {/* ========== SECTION 2: THREE-COLUMN GRID ========== */}
      {/* Three category cards side by side: Sofas, Chairs, Accessories */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-2 px-2">
        <CategoryCard
          title="Sofas"
          href={storeHref}
          image="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFN5595JRQCBA1H4WV1JNPNJ-01KFN5595J63YAK2D8PYAFHH27.jpeg"
          delay="0.1s"
        />
        <CategoryCard
          title="Chairs"
          href={storeHref}
          image="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFN55AEH9SFJT6JJF0FRAG77-01KFN55AEHV3KK6W66YEXH8Y8B.jpeg"
          delay="0.2s"
        />
        <CategoryCard
          title="Accessories"
          href={storeHref}
          image="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFN55BRGXV8C48Q521MAV7G1-01KFN55BRG1MVDZ04RS767WF5Z.jpeg"
          delay="0.3s"
        />
      </section>

      {/* ========== SECTION 3: VIDEO BANNER ========== */}
      {/* Wide video with "Design your sanctuary" text overlay */}
      <section className="relative aspect-[4/5] md:aspect-[9/4] overflow-hidden mx-2 bg-neutral-900">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Make_this_into_202601211835_hn9js-01KFGT0JSW2HTMFDN0HXJREM72.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex items-end p-4 md:p-12 pb-4">
          <div className="hidden md:block md:w-1/2" /> {/* Spacer for left half */}
          <div className="w-full md:w-auto opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards] text-left">
            <h2 className="text-[40px] font-light text-white leading-tight">
              Design your sanctuary.
            </h2>
            <p className="text-base md:text-[40px] font-light text-white/70 leading-tight mb-6 max-w-xl">
              Our room planner helps you envision the perfect arrangement. 
              Choose from sofas, lounge chairs, and accent pieces.
            </p>
            <Link 
              to={storeHref as string} 
              className="group block w-full md:w-[160px] h-[80px] relative p-2 backdrop-blur-[4px] overflow-hidden transition-all duration-200 bg-white/10 hover:bg-white/20"
            >
              {/* Grain texture overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-start justify-between w-full relative z-10">
                <span className="text-[16px] text-white font-medium leading-none">Configure</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: SINGLE WIDE IMAGE ========== */}
      {/* Full-width category card showing "Sofas" */}
      <section className="grid grid-cols-1 gap-2 px-2">
        <CategoryCard
          title="Sofas"
          href={storeHref}
          image="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNBD025MABRM8XSKFZM5C8M-01KFNBD025W6SD8QCXBHMGYWRQ.jpeg"
          delay="0.1s"
          aspectRatio="aspect-[4/5] md:aspect-[9/4]"
        />
      </section>

      {/* ========== SECTION 5: TWO-COLUMN GRID ========== */}
      {/* Two category cards: Candles (left image), Blankets (right video) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
        <CategoryCard
          title="Candles"
          href={storeHref}
          image="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNC4B706QBKXD2J6RQFA9WM-01KFNC4B70TV0GQE73NE6FNE5P.jpeg"
          delay="0.1s"
          aspectRatio="aspect-[4/5] md:aspect-[9/8]"
        />
        <Link 
          to={storeHref as string}
          className="aspect-[4/5] md:aspect-[9/8] relative overflow-hidden group cursor-pointer opacity-0 animate-[fade-in_0.6s_ease-out_forwards]"
          style={{ animationDelay: "0.2s" }}
        >
          <video 
            src="https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/The_right_part_202601211844_bbulq-01KFGTHTT7PVFSMA5CQMVV1WNY.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end p-4 md:p-8">
            <span className="text-white text-[40px] font-light">
              Blankets
            </span>
          </div>
        </Link>
      </section>

      {/* ========== SECTION 6: PERSPECTIVES TEXT BANNER ========== */}
      {/* Large typography section with description */}
      <FitTextSection storeHref={storeHref} />

      {/* ========== SECTION 7: AUTO-SCROLLING ARTIST CAROUSEL ========== */}
      {/* Horizontal carousel of artist portraits with names */}
      <ArtistCarousel countryCode={countryCode || "us"} />

    </div>
  )
}

const CategoryCard = ({ 
  title, 
  href, 
  image,
  delay,
  aspectRatio = "aspect-[3/4]"
}: { 
  title: string
  href: string
  image: string
  delay: string
  aspectRatio?: string
}) => (
  <Link 
    to={href as string}
    className={`${aspectRatio} relative overflow-hidden group cursor-pointer opacity-0 animate-[fade-in_0.6s_ease-out_forwards]`}
    style={{ animationDelay: delay }}
  >
    <img 
      src={image} 
      alt={title}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    <div className="absolute inset-0 flex items-end p-4 md:p-8">
      <span className="text-white text-[40px] font-light">
        {title}
      </span>
    </div>
  </Link>
)

const FitTextSection = ({ storeHref }: { storeHref: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const [fontSize, setFontSize] = useState(100)

  useEffect(() => {
    let rafId: number | null = null
    
    const calculateFontSize = () => {
      if (!containerRef.current || !textRef.current) return
      
      const containerWidth = containerRef.current.offsetWidth
      // Start with a base size and adjust
      let testSize = 200
      textRef.current.style.fontSize = `${testSize}px`
      
      // Binary search for the right font size
      let min = 10
      let max = 500
      
      while (max - min > 1) {
        const mid = Math.floor((min + max) / 2)
        textRef.current.style.fontSize = `${mid}px`
        
        if (textRef.current.scrollWidth <= containerWidth) {
          min = mid
        } else {
          max = mid
        }
      }
      
      setFontSize(min)
    }

    const debouncedCalculate = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(calculateFontSize)
    }

    calculateFontSize()
    
    const resizeObserver = new ResizeObserver(debouncedCalculate)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section className="mx-2 bg-white py-16 px-4 md:px-12">
      <div ref={containerRef} className="w-full overflow-visible">
        <h2 
          ref={textRef}
          style={{ fontSize: `${fontSize}px` }}
          className="font-light leading-[1] tracking-[-0.03em] text-[#1a1a1a] lowercase whitespace-nowrap overflow-visible"
        >
          perspectives
        </h2>
      </div>
      <div className="flex mt-8 md:mt-4 max-w-[1800px] mx-auto">
        <div className="w-1/2 hidden md:block" />
        <div className="max-w-md text-left">
          <p className="text-[20px] text-[#4a4a4a] leading-relaxed">
            Perspectives is a visual journal featuring inspiring and diverse stories from the Grounded universe.
          </p>
          <Link 
            to={storeHref as string}
            className="text-[20px] text-[#1a1a1a] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Explore all
          </Link>
        </div>
      </div>
    </section>
  )
}

const artistData = [
  { name: "ELENA VASQUEZ", slug: "elena-vasquez", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDB6H0Y7RJ3M2S22TSQKVC-01KFNDB6H0VSQQPJJXJWB9V0G7.jpeg" },
  { name: "MARCUS LINDQVIST", slug: "marcus-lindqvist", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDAYRQZCS4HD0Z27TBKYPS-01KFNDAYRQ88F5KRWEGKPQKV17.jpeg" },
  { name: "SOFIA MORENO", slug: "sofia-moreno", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDB0VZ8QZACN7XX0MQVC03-01KFNDB0VZ3MKKHGRZRSPZX0VD.jpeg" },
  { name: "JAMES THORNTON", slug: "james-thornton", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDB201N3JYTEWY3M82XJCK-01KFNDB201641X3Y9W3CKE2G1V.jpeg" },
  { name: "ANNA BERGSTROM", slug: "anna-bergstrom", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDB39AMXE7QG6JAV0BYB1Q-01KFNDB39A674QXBV7HYDSXXZN.jpeg" },
  { name: "DAVID CHEN", slug: "david-chen", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNDB51Q4VK0B6T2M6KQXCPP-01KFNDB51QTS52HVRMDA4Y65MV.jpeg" },
  { name: "MARIA SANTOS", slug: "maria-santos", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNFAFPDJEFQW9HPFT0XYHCS-01KFNFAFPD5WJTRNVSXSSWGVH5.jpeg" },
  { name: "LUCAS ERIKSEN", slug: "lucas-eriksen", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNFAG50MPDX3MJ6K3WZ4T1J-01KFNFAG50S8QT4WRP2Q4P1W47.jpeg" },
  { name: "YUKI TANAKA", slug: "yuki-tanaka", image: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KFNFAH35D2Y9BFAP7F3T9HV5-01KFNFAH35GP1V3MN44BE5MFHC.jpeg" },
]

const ArtistCarousel = ({ countryCode }: { countryCode: string }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Momentum tracking
  const velocity = useRef(0)
  const lastMouseX = useRef(0)
  const lastMoveTime = useRef(0)
  const momentumAnimationRef = useRef<number | null>(null)
  const [hasMomentum, setHasMomentum] = useState(false)
  
  // Calculate single set width (will be set after mount)
  const singleSetWidth = useRef(0)
  
  useEffect(() => {
    // Each item is ~402px (400px + 2px gap) on desktop, calculate total
    const itemWidth = window.innerWidth >= 768 ? 402 : 322
    singleSetWidth.current = itemWidth * artistData.length
  }, [])

  // Auto-scroll using setInterval for consistent speed (only when not dragging and no momentum)
  useEffect(() => {
    if (isDragging || hasMomentum) return
    const container = scrollContainerRef.current
    if (!container) return
    
    const itemWidth = window.innerWidth >= 768 ? 402 : 322
    const totalWidth = itemWidth * artistData.length
    
    const interval = setInterval(() => {
      container.scrollLeft += 1
      
      // Reset seamlessly when we've scrolled one full set
      if (container.scrollLeft >= totalWidth) {
        container.scrollLeft = 0
      }
    }, 20) // ~50px per second (1px every 20ms)
    
    return () => clearInterval(interval)
  }, [isDragging, hasMomentum])

  const hasDragged = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Stop any ongoing momentum animation
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current)
      momentumAnimationRef.current = null
    }
    setHasMomentum(false)
    
    setIsDragging(true)
    hasDragged.current = false
    dragStartX.current = e.clientX
    lastMouseX.current = e.clientX
    lastMoveTime.current = performance.now()
    velocity.current = 0
    dragStartScroll.current = scrollContainerRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const now = performance.now()
    const dt = now - lastMoveTime.current
    const dx = e.clientX - lastMouseX.current
    
    // Track velocity (smoothed)
    if (dt > 0) {
      const instantVelocity = dx / dt * 16 // normalize to ~60fps
      velocity.current = velocity.current * 0.7 + instantVelocity * 0.3 // smooth
    }
    
    lastMouseX.current = e.clientX
    lastMoveTime.current = now
    
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > 5) {
      hasDragged.current = true
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = dragStartScroll.current - diff
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    
    // Apply momentum if velocity is significant
    if (Math.abs(velocity.current) > 0.5) {
      setHasMomentum(true)
      
      const container = scrollContainerRef.current
      if (!container) return
      
      const itemWidth = window.innerWidth >= 768 ? 402 : 322
      const totalWidth = itemWidth * artistData.length
      const friction = 0.95 // decay rate
      
      const animateMomentum = () => {
        velocity.current *= friction
        container.scrollLeft -= velocity.current
        
        // Handle looping
        if (container.scrollLeft >= totalWidth) {
          container.scrollLeft = 0
        } else if (container.scrollLeft < 0) {
          container.scrollLeft = totalWidth - 1
        }
        
        // Continue until velocity is very low
        if (Math.abs(velocity.current) > 0.3) {
          momentumAnimationRef.current = requestAnimationFrame(animateMomentum)
        } else {
          setHasMomentum(false)
          momentumAnimationRef.current = null
        }
      }
      
      momentumAnimationRef.current = requestAnimationFrame(animateMomentum)
    }
  }

  // Add window-level mouseup listener to catch releases outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging])

  // Touch event handlers for mobile (with momentum)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Stop any ongoing momentum animation
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current)
      momentumAnimationRef.current = null
    }
    setHasMomentum(false)
    
    setIsDragging(true)
    hasDragged.current = false
    dragStartX.current = e.touches[0].clientX
    lastMouseX.current = e.touches[0].clientX
    lastMoveTime.current = performance.now()
    velocity.current = 0
    dragStartScroll.current = scrollContainerRef.current?.scrollLeft || 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const now = performance.now()
    const dt = now - lastMoveTime.current
    const dx = e.touches[0].clientX - lastMouseX.current
    
    // Track velocity (smoothed)
    if (dt > 0) {
      const instantVelocity = dx / dt * 16 // normalize to ~60fps
      velocity.current = velocity.current * 0.7 + instantVelocity * 0.3 // smooth
    }
    
    lastMouseX.current = e.touches[0].clientX
    lastMoveTime.current = now
    
    const diff = e.touches[0].clientX - dragStartX.current
    if (Math.abs(diff) > 5) {
      hasDragged.current = true
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = dragStartScroll.current - diff
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Apply momentum if velocity is significant
    if (Math.abs(velocity.current) > 0.5) {
      setHasMomentum(true)
      
      const container = scrollContainerRef.current
      if (!container) return
      
      const itemWidth = window.innerWidth >= 768 ? 402 : 322
      const totalWidth = itemWidth * artistData.length
      const friction = 0.95 // decay rate
      
      const animateMomentum = () => {
        velocity.current *= friction
        container.scrollLeft -= velocity.current
        
        // Handle looping
        if (container.scrollLeft >= totalWidth) {
          container.scrollLeft = 0
        } else if (container.scrollLeft < 0) {
          container.scrollLeft = totalWidth - 1
        }
        
        // Continue until velocity is very low
        if (Math.abs(velocity.current) > 0.3) {
          momentumAnimationRef.current = requestAnimationFrame(animateMomentum)
        } else {
          setHasMomentum(false)
          momentumAnimationRef.current = null
        }
      }
      
      momentumAnimationRef.current = requestAnimationFrame(animateMomentum)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Triplicate items for seamless looping
  const items = [...artistData, ...artistData, ...artistData]

  return (
    <section className="pb-16 overflow-hidden">
      <div
        className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex gap-2 select-none w-max"
      >
        {items.map((artist, index) => (
          <a 
            key={`${artist.name}-${index}`}
            href={`/${countryCode}/store`}
            className="flex-shrink-0 w-[320px] md:w-[400px] cursor-pointer block"
            onClick={handleLinkClick}
            onDragStart={(e) => e.preventDefault()}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img 
                src={artist.image} 
                alt={artist.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
            <p className="mt-3 text-[11px] font-medium tracking-[0.15em] text-[#1a1a1a]">
              {artist.name}
            </p>
          </a>
        ))}
        </div>
      </div>
    </section>
  )
}

export default Home
