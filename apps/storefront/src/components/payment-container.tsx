import Radio from "@/components/ui/radio"
import { paymentMethodsData } from "@/lib/constants/payment-methods"
import React from "react"

type PaymentContainerProps = {
  paymentProviderId: string;
  selectedPaymentOptionId: string | null;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  disabled = false,
  children,
  onClick,
}) => {
  const isSelected = selectedPaymentOptionId === paymentProviderId;

  return (
    <div
      className={`flex flex-col gap-y-1 text-sm cursor-pointer p-2 border mb-2 bg-neutral-50 border-neutral-200 hover:border-neutral-300 transition-colors ${
        isSelected ? "!border-neutral-900" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${isSelected ? "gap-x-2" : ""}`}>
          <Radio checked={isSelected} readOnly />
          <p className="text-base font-medium">
            {paymentMethodsData[paymentProviderId]?.title || paymentProviderId}
          </p>
        </div>
        <span className="justify-self-end text-neutral-900">
          {paymentMethodsData[paymentProviderId]?.icon}
        </span>
      </div>
      {children}
    </div>
  );
};

export default PaymentContainer;
