import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XMarkMini } from "@medusajs/icons"
import { clsx } from "clsx"

const Drawer = DialogPrimitive.Root

const DrawerTrigger = DialogPrimitive.Trigger

const DrawerClose = DialogPrimitive.Close

const DrawerPortal = DialogPrimitive.Portal

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={clsx(
      "fixed inset-0 z-[200] bg-black/40 backdrop-blur-lg",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Grain overlay using CSS noise - matching mega menu */}
    <div 
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px"
      }}
    />
  </DialogPrimitive.Overlay>
))
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

const drawerVariants = cva(
  "fixed z-[200] overflow-hidden",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-neutral-200 shadow-lg",
        bottom: "inset-x-0 bottom-0 border-t border-neutral-200 shadow-lg",
        left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
        right: "top-2 right-2 bottom-2 h-[calc(100vh-16px)] w-[480px] max-w-[calc(100vw-16px)] rounded-none shadow-lg",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  hideClose?: boolean
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ side = "right", className, children, hideClose, ...props }, ref) => {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-describedby={undefined}
        className={clsx(drawerVariants({ side }), className)}
        {...props}
      >
        {!hideClose && (
          <DialogPrimitive.Close 
            data-drawer-close
            className="absolute right-4 top-4 text-neutral-600 hover:text-neutral-500 transition-colors focus:outline-none disabled:pointer-events-none"
          >
            <XMarkMini className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = DialogPrimitive.Content.displayName

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "flex items-center justify-between h-16 px-6 border-b border-neutral-200",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("p-6 border-t border-neutral-200", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={clsx("text-lg text-neutral-900", className)}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsx("text-sm text-neutral-600", className)}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
