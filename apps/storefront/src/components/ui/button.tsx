import { clsx } from "clsx"

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "secondary" | "danger" | "transparent";
  size?: "full" | "fit";
};

export const Button = ({
  variant = "primary",
  className,
  size = "full",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        "cursor-pointer disabled:cursor-default",
        "inline-flex items-center justify-center gap-2 px-4 py-2",
        "rounded-none shadow-none appearance-none border",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-base font-medium",
        size === "full" && "w-full",
        size === "fit" && "w-fit",
        {
          "bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 border-transparent":
            variant === "primary",
          "bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 border-neutral-900":
            variant === "secondary",
          "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-900 border-transparent":
            variant === "danger",
          "bg-transparent text-neutral-900 hover:bg-transparent active:bg-transparent border-transparent":
            variant === "transparent",
        },
        className
      )}
    />
  )
}
