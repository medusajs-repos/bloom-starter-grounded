import { CheckoutStep, CheckoutStepKey } from "@/lib/types/global"
import { clsx } from "clsx"

type CheckoutProgressProps = {
  steps: CheckoutStep[];
  currentStepIndex: number;
  handleStepChange: (step: CheckoutStepKey) => void;
  className?: string;
};

const CheckoutProgress = ({
  steps,
  currentStepIndex,
  handleStepChange,
  className,
}: CheckoutProgressProps) => {
  return (
    <div className={clsx("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isDisabled = index > currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => handleStepChange(step.key)}
              disabled={isDisabled}
              className={clsx(
                "flex items-center gap-3 transition-colors group",
                isCompleted && "cursor-pointer",
                isCurrent && "cursor-default",
                isDisabled && "cursor-not-allowed"
              )}
            >
              <span
                className={clsx(
                  "flex items-center justify-center w-8 h-8 text-[13px] font-medium border transition-all duration-200",
                  isCompleted && "bg-neutral-900 border-neutral-900 text-white",
                  isCurrent && "border-neutral-900 text-neutral-900 bg-white",
                  isDisabled && "border-neutral-300 text-neutral-400 bg-white"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={clsx(
                  "hidden sm:block text-[14px] font-medium transition-colors",
                  isCompleted && "text-neutral-900 group-hover:text-neutral-600",
                  isCurrent && "text-neutral-900",
                  isDisabled && "text-neutral-400"
                )}
              >
                {step.title}
              </span>
            </button>
            {!isLast && (
              <div
                className={clsx(
                  "flex-1 h-px mx-4 sm:mx-6 transition-colors",
                  isCompleted ? "bg-neutral-900" : "bg-neutral-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutProgress;
