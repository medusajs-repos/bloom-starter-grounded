import { useContext, createContext } from "react"

type ToastContextType = {
  message: string | null
  showToast: (message: string) => void
  hideToast: () => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
