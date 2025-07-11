import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 sm:h-11 sm:px-5 sm:py-2.5",
        sm: "h-9 rounded-md px-3 sm:h-10 sm:px-4",
        lg: "h-11 rounded-md px-8 sm:h-12 sm:px-10",
        icon: "h-10 w-10 sm:h-11 sm:w-11",
        touch: "min-h-[44px] px-4 py-2.5 sm:px-5 sm:py-3", // Touch-friendly minimum
        touchCompact: "min-h-[40px] px-3 py-2 sm:px-4 sm:py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Enhanced responsive button variants
const ButtonMobile = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { fullWidth?: boolean }
>(({ className, variant, size = "touch", fullWidth, ...props }, ref) => {
  return (
    <Button
      className={cn(
        "transition-all duration-200 active:scale-[0.98]",
        fullWidth && "w-full",
        className
      )}
      variant={variant}
      size={size}
      ref={ref}
      {...props}
    />
  )
})
ButtonMobile.displayName = "ButtonMobile"

const ButtonIcon = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { rounded?: boolean }
>(({ className, variant = "ghost", size = "icon", rounded, ...props }, ref) => {
  return (
    <Button
      className={cn(
        "shrink-0",
        rounded && "rounded-full",
        className
      )}
      variant={variant}
      size={size}
      ref={ref}
      {...props}
    />
  )
})
ButtonIcon.displayName = "ButtonIcon"

export { Button, ButtonMobile, ButtonIcon, buttonVariants }
