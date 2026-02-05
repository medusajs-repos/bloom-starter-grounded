"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface HeroSlide {
  id: number
  videoUrl: string
  thumbnail: string
  title: string
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    videoUrl: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Can_you_add_202601211627_qpcf0-01KFGJQ8H6WEA9G00BJPGZ7NRD.mp4",
    thumbnail: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Can_you_add_202601211627_qpcf0-01KFGJQ8H6WEA9G00BJPGZ7NRD.mp4",
    title: "Quiet Comfort, Thoughtfully Designed."
  },
  {
    id: 2,
    videoUrl: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Make_this_into_202601211724_wulmc-01KFGP3354TBZNRP9RSJVXXEP4.mp4",
    thumbnail: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Make_this_into_202601211724_wulmc-01KFGP3354TBZNRP9RSJVXXEP4.mp4",
    title: "Seating, Refined to Its Purest Form."
  },
  {
    id: 3,
    videoUrl: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Make_this_into_202601211835_hn9js-01KFGT0JSW2HTMFDN0HXJREM72.mp4",
    thumbnail: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/Make_this_into_202601211835_hn9js-01KFGT0JSW2HTMFDN0HXJREM72.mp4",
    title: "Crafted for Living, Built to Last."
  },
  {
    id: 4,
    videoUrl: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/The_right_part_202601211844_bbulq-01KFGTHTT7PVFSMA5CQMVV1WNY.mp4",
    thumbnail: "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/The_right_part_202601211844_bbulq-01KFGTHTT7PVFSMA5CQMVV1WNY.mp4",
    title: "Where Form Meets Function."
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [shouldMarquee, setShouldMarquee] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Auto-play when slide changes
  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by browser
      })
    }
  }, [currentSlide, isPlaying])

  const currentSlideData = heroSlides[currentSlide]

  // Check if title needs marquee effect
  useEffect(() => {
    if (!isMounted) return
    
    const checkOverflow = () => {
      if (titleRef.current && containerRef.current) {
        const titleWidth = titleRef.current.scrollWidth
        const containerWidth = containerRef.current.offsetWidth
        setShouldMarquee(titleWidth > containerWidth)
      }
    }

    // Check on mount and slide change
    checkOverflow()

    // Check on resize
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [currentSlide, currentSlideData.title, isMounted])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        key={currentSlideData.id}
        autoPlay
        muted
        playsInline
        onEnded={goToNext}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      >
        <source src={currentSlideData.videoUrl} type="video/mp4" />
      </video>
      
      {/* Grain overlay for vintage feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Subtle dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Bottom-left anchored large header - changes with slide */}
      <div 
        ref={containerRef}
        className="absolute bottom-[140px] md:bottom-[16px] left-0 w-full overflow-hidden py-4"
      >
        <div 
          key={currentSlideData.id}
          className={`pl-[32px] ${shouldMarquee ? 'animate-marquee inline-flex gap-[100px]' : ''}`}
        >
          <h1 
            ref={titleRef}
            className="text-[48px] sm:text-[72px] md:text-[96px] lg:text-[120px] xl:text-[144px] font-light text-white leading-[1.1] tracking-tight whitespace-nowrap drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] animate-[fade-in_0.5s_ease-out_forwards]"
          >
            {currentSlideData.title}
          </h1>
          {shouldMarquee && (
            <h1 
              aria-hidden="true"
              className="text-[48px] sm:text-[72px] md:text-[96px] lg:text-[120px] xl:text-[144px] font-light text-white leading-[1.1] tracking-tight whitespace-nowrap drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            >
              {currentSlideData.title}
            </h1>
          )}
        </div>
      </div>

      {/* Control Panel - Below hero on mobile, top right on desktop */}
      <div 
        className="absolute bottom-4 left-4 right-4 md:bottom-auto md:left-auto md:top-[calc(48px+8px)] md:right-[8px] z-10 flex w-auto md:w-[300px] flex-col justify-end overflow-hidden rounded-none"
      >
        {/* Main content with frosted glass background */}
        <div className="relative z-20 flex flex-col">
          {/* Header with channel info and controls */}
          <div className="flex w-full items-center justify-between pt-1 pr-1 pb-10 pl-3">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-white/70 uppercase tracking-wider">CHANNEL</span>
              <span className="text-[13px] font-bold text-white leading-tight">{String(currentSlide + 1).padStart(3, '0')}</span>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 flex items-center justify-center rounded-none bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Previous slide"
              >
                <PreviousIcon />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 flex items-center justify-center rounded-none bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                onClick={goToNext}
                className="w-10 h-10 flex items-center justify-center rounded-none bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Next slide"
              >
                <NextIcon />
              </button>
            </div>
          </div>
          
          {/* Thumbnail Grid */}
          <div className="flex gap-1.5 pb-1 px-1">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`relative flex-1 h-10 rounded-none overflow-hidden transition-all duration-200 cursor-pointer ${
                  currentSlide === index 
                    ? '' 
                    : 'opacity-80 hover:opacity-100'
                }`}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              >
                <video
                  src={`${slide.thumbnail}#t=0.1`}
                  className="w-full h-10 object-cover rounded-none"
                  muted
                  playsInline
                  preload="metadata"
                />
                {currentSlide === index && (
                  <div className="absolute inset-0 border border-white rounded-none pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Frosted glass background layer */}
        <div 
          className="absolute bottom-0 left-0 z-10 h-full w-full rounded-none backdrop-blur-[4px] overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.10)'
          }}
        >
          {/* Grain texture overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
        </div>
      </div>
    </section>
  )
}

// Icon Components
const PreviousIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
)

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const NextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
)

export default HeroSlider
