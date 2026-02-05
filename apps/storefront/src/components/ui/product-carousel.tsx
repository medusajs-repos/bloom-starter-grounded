import { HttpTypes } from "@medusajs/types"
import { useRef, useState, useCallback, useEffect, memo } from "react"
import { clsx } from "clsx"
import { XMarkMini } from "@medusajs/icons"

type ProductCarouselProps = {
  images: HttpTypes.StoreProductImage[]
}

const ProductCarousel = memo(function ProductCarousel({ images }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lightboxScrollRef = useRef<HTMLDivElement>(null)
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const hasDragged = useRef(false)
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0)
  
  // Lightbox drag state
  const [isLightboxDragging, setIsLightboxDragging] = useState(false)
  const lightboxDragStartX = useRef(0)
  const lightboxDragStartScroll = useRef(0)
  const lightboxHasDragged = useRef(false)
  const lightboxVelocity = useRef(0)
  const lightboxLastMouseX = useRef(0)
  const lightboxLastMoveTime = useRef(0)
  const lightboxMomentumRef = useRef<number | null>(null)
  
  // Momentum tracking
  const velocity = useRef(0)
  const lastMouseX = useRef(0)
  const lastMoveTime = useRef(0)
  const momentumAnimationRef = useRef<number | null>(null)
  const [hasMomentum, setHasMomentum] = useState(false)

  // Open lightbox at specific image
  const openLightbox = (index: number) => {
    if (hasDragged.current) return // Don't open if user was dragging
    setLightboxStartIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        closeLightbox()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [lightboxOpen])

  // Lightbox drag handlers
  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (lightboxMomentumRef.current) {
      cancelAnimationFrame(lightboxMomentumRef.current)
      lightboxMomentumRef.current = null
    }
    
    setIsLightboxDragging(true)
    lightboxHasDragged.current = false
    lightboxDragStartX.current = e.clientX
    lightboxLastMouseX.current = e.clientX
    lightboxLastMoveTime.current = performance.now()
    lightboxVelocity.current = 0
    lightboxDragStartScroll.current = lightboxScrollRef.current?.scrollLeft || 0
  }

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!isLightboxDragging) return
    e.preventDefault()
    
    const now = performance.now()
    const dt = now - lightboxLastMoveTime.current
    const dx = e.clientX - lightboxLastMouseX.current
    
    if (dt > 0) {
      const instantVelocity = dx / dt * 16
      lightboxVelocity.current = lightboxVelocity.current * 0.7 + instantVelocity * 0.3
    }
    
    lightboxLastMouseX.current = e.clientX
    lightboxLastMoveTime.current = now
    
    const diff = e.clientX - lightboxDragStartX.current
    if (Math.abs(diff) > 5) {
      lightboxHasDragged.current = true
    }
    if (lightboxScrollRef.current) {
      lightboxScrollRef.current.scrollLeft = lightboxDragStartScroll.current - diff
    }
  }

  const handleLightboxMouseUp = useCallback(() => {
    setIsLightboxDragging(false)
    
    if (Math.abs(lightboxVelocity.current) > 0.5) {
      const container = lightboxScrollRef.current
      if (!container) return
      
      const friction = 0.95
      const setWidth = lightboxSingleSetWidth.current
      
      const animateMomentum = () => {
        lightboxVelocity.current *= friction
        container.scrollLeft -= lightboxVelocity.current
        
        // Handle infinite scroll looping during momentum
        if (setWidth > 0) {
          if (container.scrollLeft < setWidth * 0.3) {
            container.scrollLeft += setWidth
          } else if (container.scrollLeft > setWidth * 1.7) {
            container.scrollLeft -= setWidth
          }
        }
        
        if (Math.abs(lightboxVelocity.current) > 0.3) {
          lightboxMomentumRef.current = requestAnimationFrame(animateMomentum)
        } else {
          lightboxMomentumRef.current = null
        }
      }
      
      lightboxMomentumRef.current = requestAnimationFrame(animateMomentum)
    }
  }, [])

  // Lightbox touch handlers
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (lightboxMomentumRef.current) {
      cancelAnimationFrame(lightboxMomentumRef.current)
      lightboxMomentumRef.current = null
    }
    
    setIsLightboxDragging(true)
    lightboxHasDragged.current = false
    lightboxDragStartX.current = e.touches[0].clientX
    lightboxLastMouseX.current = e.touches[0].clientX
    lightboxLastMoveTime.current = performance.now()
    lightboxVelocity.current = 0
    lightboxDragStartScroll.current = lightboxScrollRef.current?.scrollLeft || 0
  }

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (!isLightboxDragging) return
    
    const now = performance.now()
    const dt = now - lightboxLastMoveTime.current
    const dx = e.touches[0].clientX - lightboxLastMouseX.current
    
    if (dt > 0) {
      const instantVelocity = dx / dt * 16
      lightboxVelocity.current = lightboxVelocity.current * 0.7 + instantVelocity * 0.3
    }
    
    lightboxLastMouseX.current = e.touches[0].clientX
    lightboxLastMoveTime.current = now
    
    const diff = e.touches[0].clientX - lightboxDragStartX.current
    if (Math.abs(diff) > 5) {
      lightboxHasDragged.current = true
    }
    if (lightboxScrollRef.current) {
      lightboxScrollRef.current.scrollLeft = lightboxDragStartScroll.current - diff
    }
  }

  const handleLightboxTouchEnd = () => {
    setIsLightboxDragging(false)
    
    if (Math.abs(lightboxVelocity.current) > 0.5) {
      const container = lightboxScrollRef.current
      if (!container) return
      
      const friction = 0.95
      const setWidth = lightboxSingleSetWidth.current
      
      const animateMomentum = () => {
        lightboxVelocity.current *= friction
        container.scrollLeft -= lightboxVelocity.current
        
        // Handle infinite scroll looping during momentum
        if (setWidth > 0) {
          if (container.scrollLeft < setWidth * 0.3) {
            container.scrollLeft += setWidth
          } else if (container.scrollLeft > setWidth * 1.7) {
            container.scrollLeft -= setWidth
          }
        }
        
        if (Math.abs(lightboxVelocity.current) > 0.3) {
          lightboxMomentumRef.current = requestAnimationFrame(animateMomentum)
        } else {
          lightboxMomentumRef.current = null
        }
      }
      
      lightboxMomentumRef.current = requestAnimationFrame(animateMomentum)
    }
  }

  // Global mouseup for lightbox
  useEffect(() => {
    const handleGlobalLightboxMouseUp = () => {
      if (isLightboxDragging) {
        handleLightboxMouseUp()
      }
    }
    window.addEventListener('mouseup', handleGlobalLightboxMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalLightboxMouseUp)
  }, [isLightboxDragging, handleLightboxMouseUp])

  // Track lightbox image widths for infinite scroll
  const lightboxImageWidths = useRef<number[]>([])
  const lightboxSingleSetWidth = useRef(0)

  // Handle lightbox infinite scroll looping
  const handleLightboxScroll = useCallback(() => {
    const container = lightboxScrollRef.current
    if (!container || lightboxSingleSetWidth.current === 0) return

    const scrollLeft = container.scrollLeft
    const setWidth = lightboxSingleSetWidth.current

    // If scrolled to the start (first set), jump to middle set
    if (scrollLeft < setWidth * 0.3) {
      container.scrollLeft = scrollLeft + setWidth
    }
    // If scrolled to the end (third set), jump to middle set
    else if (scrollLeft > setWidth * 1.7) {
      container.scrollLeft = scrollLeft - setWidth
    }
  }, [])

  // Scroll to correct image when lightbox opens and setup infinite scroll
  useEffect(() => {
    if (lightboxOpen && lightboxScrollRef.current) {
      const container = lightboxScrollRef.current
      
      // Wait for images to render, then calculate widths
      requestAnimationFrame(() => {
        const imageElements = container.querySelectorAll('img')
        const gap = 8
        let totalWidth = 0
        
        // Get widths of first set of images
        const widths: number[] = []
        for (let i = 0; i < images.length && i < imageElements.length; i++) {
          const width = imageElements[i].getBoundingClientRect().width
          widths.push(width)
          totalWidth += width + gap
        }
        
        lightboxImageWidths.current = widths
        lightboxSingleSetWidth.current = totalWidth

        // Calculate scroll position to start at the middle set at the correct image
        let scrollPos = totalWidth // Start of middle set
        for (let i = 0; i < lightboxStartIndex; i++) {
          scrollPos += (widths[i] || 0) + gap
        }
        container.scrollLeft = scrollPos
      })
    }
  }, [lightboxOpen, lightboxStartIndex, images.length])

  // Triple the images for infinite scroll effect (clone before and after)
  const tripleImages = [...images, ...images, ...images]
  const singleSetWidth = useRef(0)

  // Handle infinite scroll looping
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || singleSetWidth.current === 0) return

    const scrollLeft = container.scrollLeft
    const setWidth = singleSetWidth.current

    // If scrolled to the start (first set), jump to middle set
    if (scrollLeft < setWidth * 0.5) {
      container.scrollLeft = scrollLeft + setWidth
    }
    // If scrolled to the end (third set), jump to middle set
    else if (scrollLeft > setWidth * 1.5) {
      container.scrollLeft = scrollLeft - setWidth
    }
  }, [])

  // Calculate single set width and set initial scroll position
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || images.length === 0) return

    // Calculate width of one set of images (image width + gap)
    const imageWidth = 576
    const gap = 8
    singleSetWidth.current = images.length * (imageWidth + gap)

    // Start at the middle set
    container.scrollLeft = singleSetWidth.current
  }, [images.length])

  // Auto-scroll using setInterval for consistent speed (like artist carousel)
  useEffect(() => {
    if (isDragging || hasMomentum || images.length === 0) return
    
    const container = scrollContainerRef.current
    if (!container) return
    
    const imageWidth = 576
    const gap = 8
    const totalWidth = images.length * (imageWidth + gap)
    
    // Ensure initial position is set before starting auto-scroll
    if (container.scrollLeft === 0) {
      container.scrollLeft = totalWidth
    }
    
    // Start immediately with no delay
    const interval = setInterval(() => {
      container.scrollLeft += 1
      
      // Reset seamlessly when we've scrolled past the middle set
      if (container.scrollLeft >= totalWidth * 2) {
        container.scrollLeft = totalWidth
      }
    }, 40) // ~25px per second (1px every 40ms)
    
    return () => clearInterval(interval)
  }, [isDragging, hasMomentum, images.length])

  // Mouse drag handlers
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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    
    // Apply momentum if velocity is significant
    if (Math.abs(velocity.current) > 0.5) {
      setHasMomentum(true)
      
      const container = scrollContainerRef.current
      if (!container) return
      
      const imageWidth = 576
      const gap = 8
      const totalWidth = images.length * (imageWidth + gap)
      const friction = 0.95 // decay rate
      
      const animateMomentum = () => {
        velocity.current *= friction
        container.scrollLeft -= velocity.current
        
        // Handle looping
        if (container.scrollLeft >= totalWidth * 2) {
          container.scrollLeft = totalWidth
        } else if (container.scrollLeft < totalWidth * 0.5) {
          container.scrollLeft = totalWidth
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
  }, [images.length])

  // Add window-level mouseup listener to catch releases outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, handleMouseUp])

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
      
      const imageWidth = 576
      const gap = 8
      const totalWidth = images.length * (imageWidth + gap)
      const friction = 0.95 // decay rate
      
      const animateMomentum = () => {
        velocity.current *= friction
        container.scrollLeft -= velocity.current
        
        // Handle looping
        if (container.scrollLeft >= totalWidth * 2) {
          container.scrollLeft = totalWidth
        } else if (container.scrollLeft < totalWidth * 0.5) {
          container.scrollLeft = totalWidth
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

  if (images.length === 0) return null

  return (
    <div className="relative w-full">
      {/* Carousel container */}
      <div
        ref={scrollContainerRef}
        className={clsx(
          "flex gap-[8px] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none pt-[8px] pb-[8px]",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
      >
        {tripleImages.map((image, index) => {
          const originalIndex = index % images.length
          const isFirstImage = originalIndex === 0
          const isCriticalImage = originalIndex <= 2

          return (
            <div
              key={`${image.id}-${index}`}
              className="flex-shrink-0 w-[384px] h-[480px] md:w-[576px] md:h-[720px] bg-neutral-100 overflow-hidden border border-black/[0.08] cursor-pointer"
              style={{ borderWidth: '0.5px' }}
              onClick={() => openLightbox(originalIndex)}
            >
              {!!image.url && (
                <img
                  src={image.url}
                  className="w-full h-full object-cover pointer-events-none"
                  alt={isFirstImage ? "Main product image" : `Product image ${originalIndex + 1}`}
                  loading={isCriticalImage ? "eager" : "lazy"}
                  fetchPriority={isFirstImage ? "high" : undefined}
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-white"
          onClick={closeLightbox}
        >
          {/* Close button - frosted glass style */}
          <button
            onClick={closeLightbox}
            className="absolute right-2 top-4 z-10 w-[80px] h-[80px] flex flex-col justify-between items-start p-2 backdrop-blur-[4px] bg-black hover:bg-black/80 transition-colors cursor-pointer overflow-hidden"
          >
            {/* Grain texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
            <span className="text-[16px] text-white font-medium leading-none relative z-10">Close</span>
            <XMarkMini className="w-4 h-4 text-white relative z-10" />
          </button>

          {/* Horizontal scrolling images - tripled for infinite scroll */}
          <div
            ref={lightboxScrollRef}
            className={clsx(
              "h-full w-full overflow-x-auto overflow-y-hidden flex items-center gap-[8px] px-[8px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none",
              isLightboxDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{ paddingTop: 8, paddingBottom: 8 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleLightboxMouseDown}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleLightboxMouseUp}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
            onScroll={handleLightboxScroll}
          >
            {/* Triple images for infinite scroll: [set1] [set2-middle] [set3] */}
            {[...images, ...images, ...images].map((image, index) => (
              <div
                key={`lightbox-${image.id}-${index}`}
                className="flex-shrink-0 overflow-hidden"
                style={{ 
                  height: 'calc(100vh - 16px)',
                  width: 'calc((100vh - 16px) * 0.8)',
                  border: '0.5px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                {!!image.url && (
                  <img
                    src={image.url}
                    className="w-full h-full object-cover"
                    alt={`Product image ${(index % images.length) + 1}`}
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

ProductCarousel.displayName = "ProductCarousel"

export { ProductCarousel }
export default ProductCarousel
