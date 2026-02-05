import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Plus, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

interface ProductInfoDrawerProps {
  product: HttpTypes.StoreProduct
  type: "measurements" | "composition" | "availability" | "shipping"
}

const drawerConfig = {
  measurements: {
    title: "Product measurements",
    buttonText: "Product measurements",
  },
  composition: {
    title: "Composition, care & origin",
    buttonText: "Composition, care & origin",
  },
  availability: {
    title: "In-store availability",
    buttonText: "Check in-store availability",
  },
  shipping: {
    title: "Shipping, exchanges & returns",
    buttonText: "Shipping, exchanges and returns",
  },
}

export const ProductInfoDrawer = ({ product, type }: ProductInfoDrawerProps) => {
  const [open, setOpen] = useState(false)
  const config = drawerConfig[type]

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="relative w-full h-[80px] bg-white text-neutral-900 text-[16px] leading-none font-medium hover:bg-black hover:text-white transition-colors flex items-start justify-start pt-2 pl-2">
          {config.buttonText}
          <div className="absolute top-2 right-2 w-[15px] h-[15px] flex items-center justify-center">
            <Plus className="w-full h-full" />
          </div>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col bg-white" hideClose>
        {/* Header */}
        <DrawerHeader className="flex items-start justify-between !p-2 !h-auto !border-0">
          <div className="text-left p-2">
            <DrawerTitle className="text-[20px] font-medium leading-none text-[var(--color-grounded-text)]">
              {config.title}
            </DrawerTitle>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-[80px] h-[80px] flex flex-col justify-between items-start p-2 bg-black/5 hover:bg-black/10 rounded-none transition-colors self-start cursor-pointer"
          >
            <span className="text-[16px] text-black font-medium leading-none">Close</span>
            <XMark className="w-4 h-4 text-black" />
          </button>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {type === "measurements" && <MeasurementsContent product={product} />}
          {type === "composition" && <CompositionContent product={product} />}
          {type === "availability" && <AvailabilityContent product={product} />}
          {type === "shipping" && <ShippingContent />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

const MeasurementsContent = ({ product }: { product: HttpTypes.StoreProduct }) => {
  // Check for dimensions in metadata
  const width = product.metadata?.width as string | undefined
  const height = product.metadata?.height as string | undefined
  const depth = product.metadata?.depth as string | undefined
  const weight = product.weight

  const hasDimensions = width || height || depth || weight

  return (
    <div className="border-t border-[var(--color-grounded-light-gray)]">
      <div className="p-4">
        {hasDimensions ? (
          <div className="space-y-4">
            {width && (
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-[14px] text-black">Width</span>
                <span className="text-[14px] text-black">{width}</span>
              </div>
            )}
            {height && (
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-[14px] text-black">Height</span>
                <span className="text-[14px] text-black">{height}</span>
              </div>
            )}
            {depth && (
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-[14px] text-black">Depth</span>
                <span className="text-[14px] text-black">{depth}</span>
              </div>
            )}
            {weight && (
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-[14px] text-black">Weight</span>
                <span className="text-[14px] text-black">{weight}g</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[16px] text-black leading-relaxed">
            Detailed measurements for this product are not available. Please contact us for specific dimensions.
          </p>
        )}
      </div>
    </div>
  )
}

const CompositionContent = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const material = product.material
  const originCountry = product.origin_country

  return (
    <div className="border-t border-[var(--color-grounded-light-gray)]">
      <div className="p-4 space-y-6">
        {/* Composition */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Composition</h3>
          {material ? (
            <p className="text-[16px] text-black leading-relaxed">{material}</p>
          ) : (
            <p className="text-[16px] text-black leading-relaxed">
              Material information is not available for this product.
            </p>
          )}
        </div>

        {/* Care */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Care</h3>
          <ul className="space-y-2">
            <li className="text-[14px] text-black">Wipe with a dry cloth</li>
            <li className="text-[14px] text-black">Avoid direct sunlight</li>
            <li className="text-[14px] text-black">Keep away from heat sources</li>
          </ul>
        </div>

        {/* Origin */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Origin</h3>
          {originCountry ? (
            <p className="text-[14px] text-black">Made in {originCountry}</p>
          ) : (
            <p className="text-[14px] text-black">Origin information not available.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const AvailabilityContent = ({ product }: { product: HttpTypes.StoreProduct }) => {
  // Simulated store locations - in a real app, this would come from an API
  const stores = [
    { name: "Copenhagen Flagship", address: "Stroget 42, 1160 Copenhagen", available: true },
    { name: "Aarhus Store", address: "Store Torv 15, 8000 Aarhus", available: true },
    { name: "Odense Store", address: "Vestergade 28, 5000 Odense", available: false },
  ]

  return (
    <div className="border-t border-[var(--color-grounded-light-gray)]">
      <div className="p-4">
        <p className="text-[16px] text-black mb-4">
          Check availability of <span className="text-black">{product.title}</span> at our stores:
        </p>
        <div className="divide-y divide-neutral-200">
          {stores.map((store, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-3"
            >
              <div>
                <p className="text-[16px] text-black font-medium">{store.name}</p>
                <p className="text-[16px] text-neutral-500">{store.address}</p>
              </div>
              <span
                className={`text-[16px] ${
                  store.available ? "text-green-600" : "text-neutral-400"
                }`}
              >
                {store.available ? "In stock" : "Out of stock"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ShippingContent = () => {
  return (
    <div className="border-t border-[var(--color-grounded-light-gray)]">
      <div className="p-4 space-y-6">
        {/* Shipping */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Shipping</h3>
          <ul className="space-y-2">
            <li className="text-[16px] text-black">Standard delivery: 3-5 business days</li>
            <li className="text-[16px] text-black">Express delivery: 1-2 business days</li>
            <li className="text-[16px] text-black">Free shipping on orders over $200</li>
          </ul>
        </div>

        {/* Exchanges */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Exchanges</h3>
          <p className="text-[16px] text-black leading-relaxed">
            Items can be exchanged within 30 days of delivery. Items must be in original condition with tags attached.
          </p>
        </div>

        {/* Returns */}
        <div>
          <h3 className="text-[16px] font-medium text-black mb-3">Returns</h3>
          <p className="text-[16px] text-black leading-relaxed">
            Full refunds are available within 30 days of purchase. Return shipping is free for all orders.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductInfoDrawer
