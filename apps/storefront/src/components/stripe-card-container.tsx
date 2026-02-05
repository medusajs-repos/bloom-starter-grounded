import { XMark } from "@medusajs/icons"
import { useState } from "react"

type StripeCardContainerProps = {
  paymentProviderId: string;
  selectedPaymentOptionId: string | null;
  disabled?: boolean;
  setError?: (error: string | null) => void;
  onCardComplete?: () => void;
  onSelect?: () => void;
};

const StripeCardContainer: React.FC<StripeCardContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  onCardComplete,
}) => {
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  const isSelected = selectedPaymentOptionId === paymentProviderId

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ")
    setCardNumber(value)

    // Simulate validation
    const isComplete =
      value.replace(/\s/g, "").length >= 16 &&
      expiryDate.length >= 5 &&
      cvv.length >= 3
    if (isComplete) {
      onCardComplete?.()
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.slice(0, 2) + " / " + value.slice(2, 4)
    }
    setExpiryDate(value)

    // Simulate validation
    const isComplete =
      cardNumber.replace(/\s/g, "").length >= 16 &&
      value.length >= 7 &&
      cvv.length >= 3
    if (isComplete) {
      onCardComplete?.()
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCvv(value)

    // Simulate validation
    const isComplete =
      cardNumber.replace(/\s/g, "").length >= 16 &&
      expiryDate.length >= 7 &&
      value.length >= 3
    if (isComplete) {
      onCardComplete?.()
    }
  }

  const clearCardholderName = () => {
    setCardholderName("")
  }

  return (
    <>
      {isSelected && (
        <div className="mt-4 transition-all duration-150 ease-in-out space-y-2">
          {/* Card number */}
          <div className="relative">
            <div className="border border-neutral-200 rounded-none bg-white p-2">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="Card number"
                maxLength={19}
                className="bg-transparent outline-none w-full text-base text-neutral-900 placeholder:text-neutral-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Expiry and Security code */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-neutral-200 rounded-none bg-white p-2">
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="Expiration date (MM / YY)"
                maxLength={7}
                className="bg-transparent outline-none w-full text-base text-neutral-900 placeholder:text-neutral-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="border border-neutral-200 rounded-none bg-white p-2">
              <input
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="Security code"
                maxLength={4}
                className="bg-transparent outline-none w-full text-base text-neutral-900 placeholder:text-neutral-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Name on card */}
          <div className="border border-neutral-200 rounded-none bg-white p-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name on card"
                className="bg-transparent outline-none w-full text-base text-neutral-900 placeholder:text-neutral-500"
                onClick={(e) => e.stopPropagation()}
              />
              {cardholderName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearCardholderName()
                  }}
                  className="text-neutral-500 hover:text-neutral-700 flex-shrink-0 ml-2"
                >
                  <XMark className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StripeCardContainer
