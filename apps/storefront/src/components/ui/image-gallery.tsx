import { HttpTypes } from "@medusajs/types"
import { useState, useCallback, memo } from "react"
import { clsx } from "clsx"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = memo(function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  if (images.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50">
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => {
            const isFirstImage = index === 0
            const isCriticalImage = index <= 1
            
            return (
              <div
                key={image.id}
                className="w-full h-full flex-shrink-0 relative"
              >
                {!!image.url && (
                  <img
                    src={image.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={isFirstImage ? "Main product image" : `Product image ${index + 1}`}
                    loading={isCriticalImage ? "eager" : "lazy"}
                    fetchPriority={isFirstImage ? "high" : undefined}
                    decoding="async"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={clsx(
                "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-all duration-200",
                currentIndex === index 
                  ? "ring-2 ring-neutral-900 ring-offset-2" 
                  : "ring-1 ring-neutral-200 hover:ring-neutral-400"
              )}
              aria-label={`View image ${index + 1}`}
            >
              {!!image.url && (
                <img
                  src={image.url}
                  className="w-full h-full object-cover"
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

ImageGallery.displayName = "ImageGallery"

export { ImageGallery }
export default ImageGallery