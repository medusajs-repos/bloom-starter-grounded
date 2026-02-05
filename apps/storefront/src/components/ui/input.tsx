import { clsx } from "clsx"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={clsx(
        "appearance-none shadow-none outline-none focus:outline-none",
        "border border-neutral-200",
        "rounded-none",
        "text-base font-medium text-neutral-900",
        "px-2 py-2 w-full",
        "bg-neutral-50",
        "placeholder:text-neutral-500",
        className
      )}
      {...props}
    />
  )
}
