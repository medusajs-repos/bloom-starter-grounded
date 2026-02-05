import { forwardRef } from "react"

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <div className={`inline-flex items-center w-fit ${className || ""}`}>
        <input
          type="radio"
          ref={ref}
          checked={checked}
          className="sr-only"
          {...props}
        />
        {checked && (
          <span className="w-[15px] h-[15px] flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 bg-black" />
          </span>
        )}
        {label && (
          <span
            className={`text-[16px] leading-none ${
              checked ? "font-medium text-black" : "text-black"
            }`}
          >
            {label}
          </span>
        )}
      </div>
    )
  }
)

Radio.displayName = "Radio"

export default Radio
