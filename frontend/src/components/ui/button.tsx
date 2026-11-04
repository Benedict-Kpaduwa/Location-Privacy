import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold tracking-tight disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  {
    variants: {
      variant: {
        default: "bg-brand text-white",
        outline:
          "border-2 border-brand/35 bg-transparent text-accent-text",
        secondary: "bg-field text-ink",
        ghost: "bg-transparent text-mute hover:bg-field",
        destructive: "bg-risk-high text-white",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 rounded-[16px] px-5 text-[15px]",
        sm: "h-11 rounded-[14px] px-4 text-[15px]",
        lg: "h-14 rounded-[16px] px-7 text-[18px] tracking-[-0.01em]",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
